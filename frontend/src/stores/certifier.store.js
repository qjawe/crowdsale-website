import { action, observable } from 'mobx';
import Onfido from 'onfido-sdk-ui';

import backend from '../backend';

class CertifierStore {
  @observable error = null;
  @observable firstName = '';
  @observable lastName = '';
  @observable loading = false;
  @observable onfido = null;
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

      this.setOnfido({ applicantId, sdkToken });
    } catch (error) {
      this.setError(error);
    }

    this.setLoading(false);
  }

  handleOnfidoComplete = async () => {
    const result = await backend.checkApplicant(this.onfido.applicantId);

    console.warn('complete', result);
  };

  mountOnfido () {
    this.onfidoOut = Onfido.init({
      useModal: false,
      token: this.onfido.sdkToken,
      containerId: 'onfido-mount',
      onComplete: this.handleOnfidoComplete,
      steps: [
        {
          type: 'document',
          options: {
          }
        },
        'face'
      ]
    });
  }

  unmountOnfido () {
    this.onfidoOut.tearDown();
  }

  @action
  setError (error) {
    this.error = error;
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
  setOnfido ({ applicantId, sdkToken }) {
    this.onfido = { applicantId, sdkToken };
  }

  @action
  setSToken (stoken) {
    this.stoken = stoken;
  }
}

export default new CertifierStore();
