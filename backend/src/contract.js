// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const keccak = require('keccak');
const { buf2hex, padLeft } = require('./utils');

class Method {
  constructor (name, types) {
    const sig = keccak('keccak256')
                .update(Buffer.from(`${name}(${types.join(',')})`))
                .digest();

    this._name = name;
    this._id = buf2hex(sig.slice(0, 4));
    this._types = types;
  }

  get id () {
    return this._id;
  }

  data (params) {
    // TODO: convert params to hex string and append to id
    const encodedData = this._types
      .map((type, index) => {
        const param = params[index];

        if (type === 'address') {
          return padLeft(param.replace(/^0x/, ''), 64);
        }

        return '';
      })
      .join('');

    return this._id + encodedData;
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
    this[name].id = method.id;

    return this;
  }

  _call (name, params) {
    const method = this._methods.get(name);

    return this
      ._transport
      .request('eth_call', {
        to: this._address,
        data: method.data(params)
      });
  }
}

module.exports = Contract;
