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

  async nonce (address) {
    const { nonce } = await get(this.url(`/${address}/nonce`));

    return nonce;
  }

  async sendTx (tx) {
    const { hash } = await post(this.url('/tx'), { tx });

    return hash;
  }
}

export default new Backend('http://localhost:4000');
