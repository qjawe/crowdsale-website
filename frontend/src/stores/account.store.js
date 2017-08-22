import Util from 'ethereumjs-util';
import Wallet from 'ethereumjs-wallet';
import { action, observe, observable } from 'mobx';
import store from 'store';

import appStore from './app.store';
import auctionStore from './auction.store';
import backend from '../backend';

const WALLET_LS_KEY = '__crowdsale::wallet';

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

    // Fetch the pending transaction on new block
    observe(auctionStore, 'block', () => {
      this.updateAccountInfo();
    });
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

    if (wallet && wallet.crypto) {
      wallet.fromLS = true;

      this.setWallet(wallet);
    }
  }

  @action
  logout () {
    appStore.goto('home');

    this.address = '';
    this.balances = {};
    this.certified = null;
    this.error = null;
    this.unlocked = false;
    this.publicKey = null;
    this.privateKey = null;
    this.wallet = null;

    this.saveWallet();
  }

  async create (secret, password) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const wallet = Wallet.fromPrivateKey(Buffer.from(secret.slice(2), 'hex'));
        const v3Wallet = wallet.toV3(password, {
          c: 65536,
          kdf: 'pbkdf2'
        });

        return resolve(v3Wallet);
      }, 50);
    });
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
      this.updateAccountInfo();
    }
  }

  @action
  setWallet (wallet) {
    if (wallet) {
      this.setAccountInfo({ address: wallet.address });
    }

    this.wallet = wallet;
  }

  signMessage (message) {
    const { privateKey, unlocked } = this;

    if (!privateKey || !unlocked) {
      throw new Error('no unlocked account');
    }

    const msgHash = Util.hashPersonalMessage(Buffer.from(message));
    const { v, r, s } = Util.ecsign(msgHash, privateKey);

    return Util.toRpcSig(v, r, s);
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
      }, 50);
    });
  }

  async updateAccountInfo () {
    if (!this.address || !this.unlocked) {
      return;
    }

    const { eth, accounted, certified } = await backend.getAddressInfo(this.address);

    this.setBalances({ eth, accounted });
    this.setCertified(certified);
  }
}

export default new AccountStore();
