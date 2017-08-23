import BigNumber from 'bignumber.js';
import EthereumTx from 'ethereumjs-tx';
import { ecsign } from 'ethereumjs-util';
import { action, computed, observe, observable } from 'mobx';
import { Bond } from 'oo7';

import accountStore from './account.store';
import auctionStore from './auction.store';
import backend from '../backend';
import { int2hex, hex2buf, buildABIData } from '../utils';

const BUYIN_SIG = '0xd0280037';

export const BLOCKS_CONFIRMATIONS = 12;

class BuyStore {
  @observable currentTx = null;
  @observable loading = false;
  @observable notFromJapan = false;
  @observable pendingTx = null;
  @observable termsAccepted = false;
  // ETH that will be spent by the user
  @observable spend = new BigNumber(0);

  spendBond = new Bond();

  constructor () {
    this.spendBond.tie((value) => {
      this.setSpend(value);
    });

    // Fetch the pending tx (if any) when account unlocked
    observe(accountStore, 'unlocked', (changes) => {
      if (changes.oldValue !== false || changes.newValue !== true) {
        return;
      }

      this.fetchPending();
    });

    this.fetchPending();
  }

  async deletePendingTx () {
    const { pendingTx } = this;

    if (!pendingTx || !pendingTx.hash) {
      return;
    }

    const { address } = accountStore;
    const message = `delete_tx_${pendingTx.hash}`;
    const sign = accountStore.signMessage(message);

    await backend.deletePendingTx(address, sign);
    this.setPendingTx(null);
    this.setLoading(false);
  }

  async fetchPending () {
    const { address, unlocked } = accountStore;

    if (!address || !unlocked) {
      return;
    }

    const pendingTx = await backend.getPendingTx(address);

    if (pendingTx) {
      pendingTx.required = new BigNumber(pendingTx.required);
    }

    // This means the the former pending transaction got
    // through, thus display the transaction status
    if (!pendingTx && this.pendingTx) {
      this.setCurrentTxHash(this.pendingTx.hash);
    }

    this.setPendingTx(pendingTx);
  }

  async fetchTxInfo () {
    const { hash } = this.currentTx;
    const { blockNumber } = await backend.getTx(hash);
    const currentTx = { hash };

    if (blockNumber) {
      currentTx.blockNumber = new BigNumber(blockNumber);
    }

    this.setCurrentTx(currentTx);
  }

  async purchase () {
    const { address, privateKey } = accountStore;
    const { contractAddress, STATEMENT_HASH } = auctionStore;

    if (!address || !privateKey) {
      return;
    }

    this.setLoading(true);

    try {
      const nonce = await backend.nonce(address);
      const { v, r, s } = ecsign(hex2buf(STATEMENT_HASH), privateKey);
      const data = buildABIData(BUYIN_SIG, v, r, s);

      const tx = new EthereumTx({
        to: contractAddress,
        nonce,
        data,
        gasLimit: int2hex(200000),
        gasPrice: int2hex(50000000000),
        value: int2hex(this.spend)
      });

      tx.sign(privateKey);

      const serializedTx = `0x${tx.serialize().toString('hex')}`;

      const { hash, requiredEth } = await backend.sendTx(serializedTx);

      if (requiredEth) {
        return this.fetchPending();
      }

      return this.setCurrentTxHash(hash);
    } catch (error) {
      console.error(error);
    }
  }

  @action
  setLoading (loading) {
    this.loading = loading;
  }

  @action
  setNotFromJapan (notFromJapan) {
    this.notFromJapan = notFromJapan;
  }

  @action
  setPendingTx (pendingTx) {
    // New Pending Transaction
    if (pendingTx && !this.pendingTx) {
      if (this.pendingTxDisposer) {
        this.pendingTxDisposer();
      }

      // Fetch the pending transaction on new block
      this.pendingTxDisposer = observe(auctionStore, 'block', () => {
        this.fetchPending();
      });
    }

    // Remove the observer if no more pendingTx
    if (!pendingTx && this.pendingTxDisposer) {
      this.pendingTxDisposer();
    }

    this.pendingTx = pendingTx;
  }

  @action
  setSpend (spend) {
    this.spend = spend;
  }

  @action
  setTermsAccepted (termsAccepted) {
    this.termsAccepted = termsAccepted;
  }

  @action
  setCurrentTxHash (hash) {
    if (this.currentTxDisposer) {
      this.currentTxDisposer();
    }

    this.currentTx = { hash };

    // Fetch the current transaction on new block
    this.currentTxDisposer = observe(auctionStore, 'block', (changes) => {
      const block = changes.newValue;
      const { blockNumber } = this.currentTx;

      if (!blockNumber) {
        return this.fetchTxInfo();
      }

      const blockHeight = block.number.sub(blockNumber).add(1).toNumber();

      if (blockHeight < BLOCKS_CONFIRMATIONS) {
        return this.setCurrentTx({ ...this.currentTx, blockHeight });
      }

      this.setLoading(false);
      this.setCurrentTx({ ...this.currentTx, completed: true });
      return this.currentTxDisposer();
    });
  }

  @action
  setCurrentTx (currentTx) {
    this.currentTx = currentTx;
  }

  @computed
  get theDeal () {
    const {
      accepted,
      refund,
      price
    } = auctionStore.theDeal(this.spend);

    const tokens = accepted.div(price).floor();

    return { tokens, refund };
  }
}

export default new BuyStore();
