import { get } from './utils';

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
}

export default new Backend('http://localhost:4000');
