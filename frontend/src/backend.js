import BigNumber from 'bignumber.js';

import { get, post } from './utils';

class Backend {
  constructor (url) {
    this._url = url;
  }

  url (path) {
    return `${this._url}${path}`;
  }

  block () {
    return get(this.url('/block'));
  }

  status () {
    return get(this.url('/'));
  }

  async certified (address) {
    return await get(this.url(`/certified/${address}`));
  }

  async chartData () {
    return await get(this.url('/chart-data'));
  }

  async checkApplicant (applicantId) {
    return await post(this.url('/check-applicant'), {
      applicantId
    });
  }

  async checkStatus ({ applicantId, checkId, address }) {
    return await post(this.url('/check-status'), {
      applicantId,
      checkId,
      address
    });
  }

  async createApplicant ({ firstName, lastName, stoken }) {
    return await post(this.url('/create-applicant'), {
      firstName,
      lastName,
      stoken
    });
  }

  async getBalances (address) {
    const { eth, accounted } = await get(this.url(`/balances/${address}`));

    return {
      eth: new BigNumber(eth),
      accounted: new BigNumber(accounted)
    };
  }

  async getTx (txHash) {
    const { transaction } = await get(this.url(`/tx/${txHash}`));

    return transaction;
  }

  async nonce (address) {
    const { nonce } = await get(this.url(`/${address}/nonce`));

    return nonce;
  }

  async sendTx (tx) {
    const { hash, requiredEth } = await post(this.url('/tx'), { tx });

    return { hash, requiredEth };
  }
}

export default new Backend('http://localhost:4000');
