import BigNumber from 'bignumber.js';

import { get, post } from './utils';

class Backend {
  constructor (url) {
    this._url = url;
  }

  url (path) {
    return `${this._url}${path}`;
  }

  status () {
    return get(this.url('/'));
  }

  async getBalances (address) {
    const { eth, dot } = await get(this.url(`/address/${address}`));

    return {
      eth: new BigNumber(eth),
      dot: new BigNumber(dot)
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
