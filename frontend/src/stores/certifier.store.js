import { action, observe, observable } from 'mobx';
import Onfido from 'onfido-sdk-ui';
import store from 'store';

import accountStore from './account.store';
import backend from '../backend';

const CHECK_STATUS_INTERVAL = 2000;

class CertifierStore {
  @observable country = '';
  @observable error = null;
  @observable firstName = '';
  @observable lastName = '';
  @observable loading = false;
  @observable onfido = null;
  @observable open = false;
  @observable pending = false;
  @observable stoken = null;

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

  @action
  load () {
    const { address } = accountStore;

    // Don't load anything if no account unlocked
    if (!address) {
      return;
    }

    const data = (store.get(LS_KEY) || {})[address] || {};

    Object.keys(data || {}).forEach((key) => {
      this[key] = data[key];
    });

    if (this.onfido && this.onfido.checkId) {
      this.pollCheckStatus();
    }
  }

  save (data = {}, clear = false) {
    const { address } = accountStore;

    // Don't save anything if no account unlocked
    if (!address) {
      return;
    }

    const prevData = store.get(LS_KEY) || {};
    const nextData = { ...prevData };

    if (clear) {
      delete nextData[address];
    } else {
      const prevAddressData = prevData[address] || {};
      const nextAddressData = {
        ...prevAddressData,
        ...data
      };

      nextData[address] = nextAddressData;
    }

    store.set(LS_KEY, nextData);
  }

  async createApplicant () {
    this.setLoading(true);

    const { country, firstName, lastName, stoken } = this;

    try {
      const { applicantId, sdkToken } = await backend.createApplicant({
        country,
        firstName,
        lastName,
        stoken
      });

      this.shouldMountOnfido = true;
      this.setOnfido({ applicantId, sdkToken });
    } catch (error) {
      this.setError(error);
    }

    this.setLoading(false);
  }

  async handleOnfidoComplete () {
    try {
      const check = await backend.createCheck(this.onfido.applicantId, accountStore.address);

      this.setOnfido({ checkId: check.id });
      this.pollCheckStatus();
    } catch (error) {
      this.setError(error);
    }

    this.unmountOnfido();
    this.setOpen(false);
  }

  mountOnfido () {
    if (this.onfidoOut || !this.onfido || !this.shouldMountOnfido) {
      return;
    }

    this.shouldMountOnfido = false;
    this.onfidoOut = Onfido.init({
      useModal: false,
      token: this.onfido.sdkToken,
      containerId: 'onfido-mount',
      onComplete: () => this.handleOnfidoComplete(),
      steps: [
        'document'
        // 'face'
      ]
    });
  }

  unmountOnfido () {
    if (this.onfidoOut) {
      this.onfidoOut.tearDown();
      delete this.onfidoOut;
    }
  }

  async pollCheckStatus () {
    if (!this.pending) {
      this.setPending(true);
    }

    const { applicantId, checkId } = this.onfido;
    const result = await backend.checkStatus({ applicantId, checkId });

    if (result.pending) {
      clearTimeout(this.checkStatusTimeoutId);
      this.checkStatusTimeoutId = setTimeout(() => {
        this.pollCheckStatus();
      }, CHECK_STATUS_INTERVAL);
      return;
    }

    if (result.valid) {
      await accountStore.updateAccountInfo();
      this.reset(false);
      return;
    }

    this.setError(new Error('Something went wrong with your verification. Please try again.'));
  }

  reset (soft = false) {
    this.error = null;
    this.firstName = '';
    this.lastName = '';
    this.loading = false;
    this.stoken = null;

    if (!soft) {
      this.onfido = null;
      this.pending = false;

      this.save(null, true);
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
    this.onfido = {
      ...(this.onfido || {}),
      ...onfido
    };

    const { applicantId, checkId } = this.onfido;

    this.save({ onfido: { applicantId, checkId } });
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
