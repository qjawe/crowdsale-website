import BigNumber from 'bignumber.js';
import { action, computed, observable } from 'mobx';
import { Bond } from 'oo7';

import auctionStore from './auction.store';

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

  @computed
  get theDeal () {
    const {
      accepted,
      bonus,
      refund,
      price
    } = auctionStore.theDeal(this.spend);

    console.warn('recompute tokens', { accepted, bonus, refund, price });

    const tokens = accepted.div(price).floor();

    return { tokens, refund };
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
}

export default new BuyStore();
