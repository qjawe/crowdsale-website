import Util from 'ethereumjs-util';
import Wallet from 'ethereumjs-wallet';
import { action, observable } from 'mobx';
import store from 'store';

import backend from '../backend';

const WALLET_LS_KEY = '__crowdsale::wallet';
const ACCOUNT_INFO_REFRESH_TIMER = 2500;

let accountInfoTimeoutId = null;

class AccountStore {
  @observable address = '';
  @observable balances = {};
  @observable certified = null;
  @observable error = null;
  @observable unlocked = false;
  @observable publicKey = null;
  @observable privateKey = null;
  @observable wallet = null;

  constructor () {
    this.loadWallet();
  }

  load (file) {
    this.setError(null);

    return this.read(file)
      .then((wallet) => {
        this.setWallet(wallet);
      })
      .catch((error) => {
        this.setError(error.message);
      });
  }

  loadWallet () {
    const wallet = store.get(WALLET_LS_KEY);

    if (wallet) {
      this.setWallet(wallet);
    }
  }

  async pollAccountInfo () {
    await this.updateAccountInfo();

    clearTimeout(accountInfoTimeoutId);
    accountInfoTimeoutId = setTimeout(() => {
      this.pollAccountInfo();
    }, ACCOUNT_INFO_REFRESH_TIMER);
  }

  read (file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsText(file);

      reader.addEventListener('error', () => {
        return reject(new Error('Unable to read the file.'));
      });

      reader.addEventListener('load', (event) => {
        try {
          const keyObject = JSON.parse(event.target.result);

          return resolve(keyObject);
        } catch (error) {
          return reject(new Error('Invalid JSON file.'));
        }
      });
    });
  }

  saveWallet () {
    store.set(WALLET_LS_KEY, this.wallet || {});
  }

  @action
  setAccountInfo ({ address, publicKey, privateKey }) {
    const cleanAddress = Util.toChecksumAddress('0x' + address.replace(/^0x/, ''));

    this.address = cleanAddress;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }

  @action
  setBalances (balances) {
    this.balances = balances;
  }

  @action
  setCertified (certified) {
    this.certified = certified;
  }

  @action
  setError (error) {
    this.error = error;
  }

  @action
  setUnlocked (unlocked) {
    this.unlocked = unlocked;

    if (unlocked) {
      this.pollAccountInfo();
    }
  }

  @action
  setWallet (wallet) {
    if (wallet) {
      this.setAccountInfo({ address: wallet.address });
    }

    this.wallet = wallet;
  }

  unlock (password, rememberWallet = false) {
    this.setError(null);

    return new Promise((resolve) => {
      // Defer to allow the UI to render before blocking
      setTimeout(() => {
        let wallet;

        try {
          wallet = Wallet.fromV3(this.wallet, password);
        } catch (_) {
          this.setError('Invalid password');
          return resolve();
        }

        if (rememberWallet) {
          this.saveWallet();
        }

        const address = '0x' + wallet.getAddress().toString('hex');
        const publicKey = wallet.getPublicKey();
        const privateKey = wallet.getPrivateKey();

        this.setAccountInfo({
          address,
          publicKey,
          privateKey
        });

        this.setUnlocked(true);
        return resolve();
      }, 0);
    });
  }

  async updateAccountInfo () {
    const { eth, accounted, certified } = await backend.getAddressInfo(this.address);

    this.setBalances({ eth, accounted });
    this.setCertified(certified);
  }
}

export default new AccountStore();
