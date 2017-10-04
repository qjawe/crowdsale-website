import BigNumber from 'bignumber.js';

import { get, post } from './utils';

// export const PICOPS_BASE_URL = 'https://staging-picops.parity.io';
export const PICOPS_BASE_URL = 'http://localhost:8081';

class Backend {
  constructor (url, picopsUrl) {
    this._url = url;
    this._picopsUrl = picopsUrl;
  }

  blockHash () {
    return get(this.url('/block/hash'));
  }

  async config () {
    const { gasPrice } = await get(this.url('/config'));

    return {
      gasPrice: new BigNumber(gasPrice)
    };
  }

  picopsUrl (path) {
    return `${this._picopsUrl}/api${path}`;
  }

  status () {
    return get(this.url('/auction'));
  }

  sale () {
    return get(this.url('/auction/constants'));
  }

  url (path) {
    return `${this._url}/api${path}`;
  }

  async getAccountFeeInfo (address) {
    const { balance, paid } = await get(this.picopsUrl(`/accounts/${address}/fee`));

    return {
      balance: new BigNumber(balance),
      paid
    };
  }

  async certifierAddress () {
    const { certifier } = await get(this.url(`/certifier`));

    return certifier;
  }

  async fee () {
    const { fee, feeRegistrar } = await get(this.picopsUrl(`/fee`));

    return { fee: new BigNumber(fee), feeRegistrar };
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

  async sendFeeTx (tx) {
    const { hash } = await post(this.picopsUrl('/fee-tx'), { tx });

    return { hash };
  }

  async sendTx (tx) {
    const { hash, requiredEth } = await post(this.url('/tx'), { tx });

    return { hash, requiredEth };
  }
}

const { protocol, hostname, port } = window.location;
const frontendPort = port ? `:${port}` : '';

export default new Backend(`${protocol}//${hostname}${frontendPort}`, PICOPS_BASE_URL);
