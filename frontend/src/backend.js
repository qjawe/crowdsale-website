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
    return get(this.url('/block/hash'));
  }

  status () {
    return get(this.url('/auction'));
  }

  sale () {
    return get(this.url('/auction/constants'));
  }

  async chartData () {
    return await get(this.url('/auction/chart'));
  }

  async checkStatus (address) {
    return await get(this.url(`/onfido/${address}`));
  }

  async createApplicant (address, { country, firstName, lastName, stoken }) {
    return await post(this.url(`/onfido/${address}/applicant`), {
      country,
      firstName,
      lastName,
      signature,
      stoken
    });
  }

  async createCheck (address) {
    return await post(this.url(`/onfido/${address}/check`));
  }

  async getAddressInfo (address) {
    const { eth, accounted, certified } = await get(this.url(`/accounts/${address}`));

    return {
      eth: new BigNumber(eth),
      accounted: new BigNumber(accounted),
      certified
    };
  }

  async nonce (address) {
    const { nonce } = await get(this.url(`/accounts/${address}/nonce`));

    return nonce;
  }

  async getPendingTx (address) {
    const { pending } = await get(this.url(`/accounts/${address}/pending`));

    return pending;
  }

  async deletePendingTx (address, sign) {
    return await del(this.url(`/accounts/${address}/pending/${sign}`));
  }

  async getTx (txHash) {
    const { transaction } = await get(this.url(`/tx/${txHash}`));

    return transaction;
  }

  async sendTx (tx) {
    const { hash, requiredEth } = await post(this.url('/tx'), { tx });

    return { hash, requiredEth };
  }
}

export default new Backend(`http://${window.location.hostname}:4000`);
