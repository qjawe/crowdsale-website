import { action, observable } from 'mobx';

import backend from '../backend';

class CertifierStore {
  @observable error = null;
  @observable firstName = '';
  @observable lastName = '';
  @observable loading = false;
  @observable sdkToken = null;
  @observable stoken = null;

  async createApplicant () {
    this.setLoading(true);

    const { firstName, lastName, stoken } = this;

    try {
      const sdkToken = await backend.createApplicant({
        firstName,
        lastName,
        stoken
      });

      this.setSDKToken(sdkToken);
    } catch (error) {
      this.setError(error);
    }

    this.setLoading(false);
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
  setSDKToken (sdkToken) {
    this.sdkToken = sdkToken;
  }

  @action
  setSToken (stoken) {
    this.stoken = stoken;
  }
}

export default new CertifierStore();
