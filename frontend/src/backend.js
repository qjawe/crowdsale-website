import BigNumber from 'bignumber.js';

import { del, get, post } from './utils';

class Backend {
  constructor (url) {
    this._url = url;
  }

  url (path) {
    return `${this._url}${path}`;
  }

  blockHash () {
    return get(this.url('/block-hash'));
  }

  sale () {
    return get(this.url('/sale'));
  }

  status () {
    return get(this.url('/'));
  }

  async chartData () {
    return await get(this.url('/chart-data'));
  }

  async createCheck (applicantId, address) {
    return await post(this.url(`/onfido/${applicantId}/check`), {
      address
    });
  }

  async checkStatus ({ applicantId, checkId }) {
    return await get(this.url(`/onfido/${applicantId}/check/${checkId}`));
  }

  async createApplicant ({ country, firstName, lastName, stoken }) {
    return await post(this.url('/onfido'), {
      country,
      firstName,
      lastName,
      stoken
    });
  }

  async deletePendingTx (address, sign) {
    return await del(this.url(`/address/${address}/pending/${sign}`));
  }

  async getAddressInfo (address) {
    const { eth, accounted, certified } = await get(this.url(`/address/${address}`));

    return {
      eth: new BigNumber(eth),
      accounted: new BigNumber(accounted),
      certified
    };
  }

  async getPendingTx (address) {
    const { pending } = await get(this.url(`/address/${address}/pending`));

    return pending;
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

export default new Backend(`http://${window.location.hostname}:4000`);
