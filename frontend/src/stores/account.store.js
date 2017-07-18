import Wallet from 'ethereumjs-wallet';
import { action, observable } from 'mobx';

export default class AccountStore {
  @observable address = '';
  @observable error = null;
  @observable wallet = {};

  load (file) {
    return this.read(file)
      .then((wallet) => {
        this.setWallet(wallet);
      })
      .catch((error) => {
        this.setError(error);
      });
  }

  read (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsText(file);

      reader.addEventListener('error', (error) => {
        return reject(error);
      });

      reader.addEventListener('load', (event) => {
        try {
          const keyObject = JSON.parse(event.target.result);

          return resolve(keyObject);
        } catch (error) {
          return reject(error);
        }
      });
    });
  }

  @action
  setError (error) {
    this.error = error;
  }

  @action
  setWallet (wallet) {
    this.wallet = wallet;
  }

  unlock (password) {
    return new Promise((resolve, reject) => {
      // Defer to allow the UI to render before blocking
      setTimeout(() => {
        let wallet;

        try {
          wallet = Wallet.fromV3(this.wallet, password);
        } catch (_) {
          return reject('Invalid password');
        }

        return resolve(wallet);
      }, 0);
    });
  }
}
