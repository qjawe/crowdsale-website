import { action, observable } from 'mobx';

class AccountStore {
  @observable address = '';
  @observable privateKey = '';

  @action
  setAccount ({ address, privateKey }) {
    this.address = address;
    this.privateKey = privateKey;
  }
}

export default new AccountStore();
