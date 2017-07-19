import BigNumber from 'bignumber.js';
import EthereumTx from 'ethereumjs-tx';
import { ecsign } from 'ethereumjs-util';
import { action, computed, observable } from 'mobx';
import { Bond } from 'oo7';

import accountStore from './account.store';
import auctionStore from './auction.store';
import backend from '../backend';
import { int2hex, hex2buf, buildABIData } from '../utils';

class BuyStore {
  @observable requiredEth = 0;
  @observable termsAccepted = false;
  // Buyin transaction hash
  @observable txHash = '';
  // ETH that will be spent by the user
  @observable spend = new BigNumber(0);

  spendBond = new Bond();

  constructor () {
    this.spendBond.tie((value) => {
      this.setSpend(value);
    });
  }

  async purchase () {
    const { address, privateKey } = accountStore;
    const { buyinId, contractAddress, statementHash } = auctionStore;

    if (!address || !privateKey) {
      return;
    }

    this.setTxHash('0x');

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

    this.setRequiredEth(requiredEth);
    this.setTxHash(hash);
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
