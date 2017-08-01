import BigNumber from 'bignumber.js';
import EthereumTx from 'ethereumjs-tx';
import { ecsign } from 'ethereumjs-util';
import { action, computed, observable } from 'mobx';
import { Bond } from 'oo7';

import accountStore from './account.store';
import auctionStore from './auction.store';
import backend from '../backend';
import { int2hex, hex2buf, buildABIData } from '../utils';

const TRANSACTION_REFRESH_DELAY = 500;

class BuyStore {
  @observable mining = false;
  @observable notFromJapan = false;
  @observable requiredEth = 0;
  @observable termsAccepted = false;
  // Buyin transaction hash
  @observable txHash = '';
  @observable sending = false;
  // ETH that will be spent by the user
  @observable spend = new BigNumber(0);

  spendBond = new Bond();

  constructor () {
    this.spendBond.tie((value) => {
      this.setSpend(value);
    });
  }

  async fetchTxInfo () {
    const transaction = await backend.getTx(this.txHash);

    if (transaction.blockNumber) {
      clearInterval(this.txIntervalId);
      this.updateTx({ sending: false, mining: false });
    }
  }

  pollTransaction () {
    this.fetchTxInfo();

    clearInterval(this.txIntervalId);
    this.txIntervalId = setInterval(() => {
      this.fetchTxInfo();
    }, TRANSACTION_REFRESH_DELAY);
  }

  async purchase () {
    const { address, privateKey } = accountStore;
    const { buyinId, contractAddress, statementHash } = auctionStore;

    if (!address || !privateKey) {
      return;
    }

    this.updateTx({ sending: true, mining: false });

    const nonce = await backend.nonce(address);
    const { v, r, s } = ecsign(hex2buf(statementHash), privateKey);
    const data = buildABIData(buyinId, v, r, s);

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
      this.updateTx({ sending: false, mining: false });
      return this.setRequiredEth(requiredEth);
    }

    this.setRequiredEth(0);
    this.setTxHash(hash);
    this.updateTx({ sending: false, mining: true });

    return this.pollTransaction();
  }

  @action
  setNotFromJapan (notFromJapan) {
    this.notFromJapan = notFromJapan;
  }

  @action
  setRequiredEth (requiredEth) {
    this.requiredEth = requiredEth;
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
  setTxHash (txHash) {
    this.txHash = txHash;
  }

  @action
  updateTx ({ sending, mining }) {
    this.mining = mining;
    this.sending = sending;
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
