import BigNumber from 'bignumber.js';
import { action, computed, observable } from 'mobx';

import backend from '../backend';
import appStore, { STEPS as APP_STEPS } from './app.store';
import auctionStore from './auction.store';
import blockStore from './block.store';
import buyStore, { GAS_VALUE as auctionGasValue } from './buy.store';
import feeStore from './fee.store';

class AccountStore {
  @observable accounted = new BigNumber(0);
  @observable address = '';
  @observable balance = new BigNumber(0);
  @observable certified = null;
  @observable paid = null;
  @observable privateKey = '';
  @observable spending = new BigNumber(0);

  @computed get missingWei () {
    const { balance, paid, spending } = this;
    const { totalFee } = feeStore;

    let missingWei = spending.add(auctionGasValue).sub(balance);

    if (!paid) {
      missingWei = missingWei.add(totalFee);
    }

    if (missingWei.lt(0)) {
      missingWei = new BigNumber(0);
    }

    // console.warn(JSON.stringify({ balance, missingWei, paid, spending, totalFee, auctionGasValue }, null, 2));
    return missingWei;
  }

  async checkCertification () {
    const { certified } = await backend.getAddressInfo(this.address);

    if (certified) {
      this.setInfo({ certified });
      this.unwatchCertification();

      // ensure we have enough funds for purchase
      this.checkPayment();
    }
  }

  async checkFeePayment () {
    const { paid } = await backend.getAccountFeeInfo(this.address);

    if (paid) {
      this.setInfo({ paid });
      this.unwatchFeePayment();
      appStore.goto('picops');
    }
  }

  async checkPayment () {
    const { eth: balance } = await backend.getAddressInfo(this.address);

    this.setInfo({ balance });

    if (this.missingWei.eq(0)) {
      this.unwatchPayment();

      if (this.certified) {
        appStore.goto('purchase');
        buyStore.purchase(this.address, this.spending, this.privateKey);
      } else {
        appStore.goto('fee-payment');
        feeStore.sendPayment(this.address, this.privateKey);
      }
    } else if (appStore.step !== APP_STEPS['payment']) {
      // Go to payment page if not there already
      appStore.goto('payment');
    }
  }

  async checkPurchase () {
    const { accounted } = await backend.getAddressInfo(this.address);

    if (!accounted.eq(this.accounted)) {
      this.setInfo({ accounted });
      appStore.goto('summary');
    }
  }

  async fetchInfo () {
    if (!this.address) {
      throw new Error('no address set in the account store');
    }

    const { accounted, eth: balance, certified } = await backend.getAddressInfo(this.address);
    const { paid } = await backend.getAccountFeeInfo(this.address);

    this.setInfo({ accounted, balance, certified, paid });
  }

  @action setAccount ({ address, privateKey }) {
    this.address = address;
    this.privateKey = privateKey;

    this.fetchInfo();
  }

  @action setInfo ({ accounted, balance, certified, paid }) {
    if (accounted !== undefined) {
      this.accounted = accounted;
    }

    if (balance !== undefined) {
      this.balance = balance;
    }

    if (certified !== undefined) {
      this.certified = certified;
    }

    if (paid !== undefined) {
      this.paid = paid;
    }
  }

  /**
   * Sets how much the user would like to spend,
   * in WEI.
   *
   * @param {BigNumber} spending The value the user wants to send, in WEI
   */
  @action setSpending (spending) {
    // No refunds allowed in the contract,
    // so need to modify the actual spending
    const { accepted } = auctionStore.theDeal(spending);

    console.warn('wants to send', spending.toFormat(), 'accepted', accepted.toString());
    this.spending = accepted;
  }

  /** Poll on new block if `this.address` is certified */
  watchCertification () {
    blockStore.on('block', this.checkCertification, this);
  }

  /** Poll on new block if `this.address` paid the fee */
  watchFeePayment () {
    blockStore.on('block', this.checkFeePayment, this);
  }

  /** Poll on new block `this.address` balance, until >= missing ETH */
  watchPayment () {
    blockStore.on('block', this.checkPayment, this);
  }

  /** Poll on new block `this.address` dot balance, until it changes */
  watchPurchase () {
    blockStore.on('block', this.checkPurchase, this);
  }

  /** Stop polling */
  unwatchCertification () {
    blockStore.removeListener('block', this.checkCertification, this);
  }

  /** Stop polling */
  unwatchFeePayment () {
    blockStore.removeListener('block', this.checkFeePayment, this);
  }

  /** Stop polling */
  unwatchPayment () {
    blockStore.removeListener('block', this.checkPayment, this);
  }

  /** Stop polling */
  unwatchPurchase () {
    blockStore.removeListener('block', this.checkPurchase, this);
  }
}

export default new AccountStore();
