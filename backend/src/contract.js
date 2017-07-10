'use strict';

const keccak = require('keccak');
const { buf2hex } = require('./utils');

class Method {
  constructor(name, types) {
    const sig = keccak('keccak256')
                .update(Buffer.from(`${name}(${types.join(',')})`))
                .digest();

    this._name = name;
    this._id = buf2hex(sig.slice(0, 4));
  }

  get id() {
    return this._id;
  }
}

class Contract {
  constructor (transport, address) {
    this._address = address;
    this._transport = transport;
    this._methods = new Map();
  }

  register (name, ...types) {
    const method = new Method(name, types);

    this._methods.set(name, method);
    this[name] = (...params) => this._call(name, params);

    return this;
  }

  _call (name, params) {
    const method = this._methods.get(name);

    return this
      ._transport
      .request('eth_call', {
        to: this._address,
        data: method.id
      });
  }
}

module.exports = Contract;
