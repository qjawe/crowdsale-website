import { action, observable } from 'mobx';
import Onfido from 'onfido-sdk-ui';

import accountStore from './account.store';
import backend from '../backend';

class CertifierStore {
  @observable error = null;
  @observable firstName = '';
  @observable lastName = '';
  @observable loading = false;
  @observable onfido = null;
  @observable open = false;
  @observable pending = false;
  @observable stoken = null;

  async createApplicant () {
    this.setLoading(true);

    const { firstName, lastName, stoken } = this;

    try {
      const { applicantId, sdkToken } = await backend.createApplicant({
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
    this.unmountOnfido();
    this.setPending(true);
    this.setOpen(false);

    try {
      const check = await backend.checkApplicant(this.onfido.applicantId);

      this.setOnfido({ checkId: check.id });
      this.pollCheckStatus();
    } catch (error) {
      this.setError(error);
    }
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
    const { applicantId, checkId } = this.onfido;
    const { address } = accountStore;
    const result = await backend.checkStatus({ applicantId, checkId, address });

    console.warn('check status', result);
    clearTimeout(this.checkStatusTimeoutId);

    if (result.pending) {
      this.checkStatusTimeoutId = setTimeout(() => {
        this.pollCheckStatus();
      }, 2000);
      return;
    }

    if (result.valid && result.tx) {
      return this.pollCertificationTransaction(result.tx);
    }

    this.setError(new Error('Something went wrong with your verification. Please try again.'));
  }

  async pollCertificationTransaction (txHash) {
    const tx = await backend.getTx(txHash);

    clearTimeout(this.certificationTxTimeoutId);

    if (!tx.blockHash || tx.blockHash === '0x') {
      this.certificationTxTimeoutId = setTimeout(() => {
        this.pollCertificationTransaction(txHash);
      }, 2000);
      return;
    }

    this.setPending(false);
  }

  reset () {
    this.error = null;
    this.firstName = '';
    this.lastName = '';
    this.loading = false;
    this.stoken = null;
  }

  @action
  setError (error) {
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
  }

  @action
  setOpen (open) {
    this.open = open;

    // closing certifier, reset
    if (!open) {
      this.reset();
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
