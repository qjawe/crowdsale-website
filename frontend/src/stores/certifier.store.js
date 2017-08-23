import { action, observe, observable } from 'mobx';
import Onfido from 'onfido-sdk-ui';
import store from 'store';

import accountStore from './account.store';
import backend from '../backend';

const CHECK_STATUS_INTERVAL = 2000;

const ONFIDO_STATUS = {
  UNKOWN: 'unkown',
  CREATED: 'created',
  PENDING: 'pending',
  COMPLETED: 'completed'
};

class CertifierStore {
  @observable country = '';
  @observable error = null;
  @observable firstName = '';
  @observable lastName = '';
  @observable loading = false;
  @observable open = false;
  @observable onfido = false;
  @observable pending = false;
  @observable stoken = null;

  sdkToken = null;

  constructor () {
    if (accountStore.unlocked) {
      this.load();
    }

    // Reload data when account unlocked
    observe(accountStore, 'unlocked', (changes) => {
      if (changes.oldValue !== false || changes.newValue !== true) {
        return;
      }

      this.load();
    });
  }

  async load () {
    const { address } = accountStore;

    // Don't load anything if no account unlocked
    if (!address) {
      return;
    }

    const { status } = await backend.checkStatus(address);

    if (status === ONFIDO_STATUS.PENDING) {
      this.pollCheckStatus();
    }
  }

  async createApplicant () {
    this.setLoading(true);

    const { address } = accountStore;
    const { country, firstName, lastName, stoken } = this;

    try {
      const message = `create_onfido_${firstName}.${lastName}@${country}`;
      const signature = accountStore.signMessage(message);

      const { sdkToken } = await backend.createApplicant(address, {
        country,
        firstName,
        lastName,
        stoken,
        signature
      });

      this.shouldMountOnfido = true;
      this.sdkToken = sdkToken;

      this.setOnfido(true);
    } catch (error) {
      this.setError(error);
    }

    this.setLoading(false);
  }

  async handleOnfidoComplete () {
    const { address } = accountStore;

    try {
      await backend.createCheck(address);
      this.pollCheckStatus();
    } catch (error) {
      this.setError(error);
    }

    this.unmountOnfido();
    this.setOpen(false);
  }

  mountOnfido () {
    if (this.onfidoObject || !this.shouldMountOnfido) {
      return;
    }

    this.shouldMountOnfido = false;
    this.onfidoObject = Onfido.init({
      useModal: false,
      token: this.sdkToken,
      containerId: 'onfido-mount',
      onComplete: () => this.handleOnfidoComplete(),
      steps: [
        'document'
        // 'face'
      ]
    });
  }

  unmountOnfido () {
    if (this.onfidoObject) {
      this.onfidoObject.tearDown();
      delete this.onfidoObject;
    }
  }

  async pollCheckStatus () {
    if (!this.pending) {
      this.setPending(true);
    }

    const { address } = accountStore;
    const { status, result } = await backend.checkStatus(address);

    if (status === ONFIDO_STATUS.PENDING) {
      clearTimeout(this.checkStatusTimeoutId);
      this.checkStatusTimeoutId = setTimeout(() => {
        this.pollCheckStatus();
      }, CHECK_STATUS_INTERVAL);
      return;
    }

    if (status === ONFIDO_STATUS.COMPLETED) {
      if (result === 'success') {
        await accountStore.updateAccountInfo();
        this.reset(false);
        return;
      }

      this.setError(new Error('Something went wrong with your verification. Please try again.'));
    }
  }

  reset (soft = false) {
    this.error = null;
    this.firstName = '';
    this.lastName = '';
    this.loading = false;
    this.onfido = false;
    this.stoken = null;

    if (!soft) {
      this.pending = false;
    }
  }

  @action
  setCountry (country) {
    this.country = country;
  }

  @action
  setError (error) {
    console.error(error);

    this.error = error;
    this.pending = false;
  }

  @action
  setFirstName (firstName) {
    this.firstName = firstName;
  }

  @action
  setLastName (lastName) {
    this.lastName = lastName;
  }

  @action
  setLoading (loading) {
    this.loading = loading;
  }

  @action
  setOnfido (onfido) {
    this.onfido = onfido;
  }

  @action
  setOpen (open) {
    this.open = open;

    // closing certifier, reset
    if (!open) {
      this.reset(true);
    }
  }

  @action
  setPending (pending) {
    this.pending = pending;
  }

  @action
  setSToken (stoken) {
    this.stoken = stoken;
  }
}

export default new CertifierStore();
