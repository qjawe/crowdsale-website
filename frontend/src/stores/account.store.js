import { action, observable } from 'mobx';

import backend from '../backend';

class AccountStore {
  @observable address = '';
  @observable certified = null;
  @observable paid = null;
  @observable privateKey = '';

  async fetchInfo () {
    if (!this.address) {
      throw new Error('no address set in the account store');
    }

    const { certified } = await backend.getAddressInfo(this.address);
    const { paid } = await backend.getAccountFeeInfo(this.address);

    this.setInfo({ certified, paid });
  }

  @action
  setAccount ({ address, privateKey }) {
    this.address = address;
    this.privateKey = privateKey;

    this.fetchInfo();
  }

  @action
  setInfo ({ certified, paid }) {
    this.certified = certified;
    this.paid = paid;
  }
}

export default new AccountStore();
