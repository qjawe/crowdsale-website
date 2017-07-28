// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const BigNumber = require('bignumber.js');
const keccak = require('keccak');
const { buf2hex } = require('./utils');

class Method {
  /**
   * Abstraction over a contract function
   *
   * @param {String}        name  function name
   * @param {Array<String>} types array of string types, eg.: ['uint256']
   */
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

  /**
   * Convert an array of arguments to a call data
   *
   * @param  {Array<String|Number|BigNumber>} args strings need to be `0x` prefixed
   *
   * @return {String} `0x` prefixed call data (including the 4 byte function signature)
   */
  data (args) {
    if (args.length !== this._types.length) {
      throw new Error(`[${this._name}] Wrong number of arguments: ${args.length}, expected ${this._types.length}`);
    }

    const encodedData = this._types
      .map((type, index) => {
        const arg = args[index];

        if (typeof arg === 'string' && arg.substring(0, 2) === '0x') {
          return arg.substring(2).padStart(64, '0');
        }

        if (typeof arg === 'number' || arg instanceof BigNumber) {
          return arg.toString(16).padStart(64, '0');
        }

        throw new Error(`[${this._name}] Cannot convert argument ${index} to call data`);
      })
      .join('');

    return this._id + encodedData;
  }
}

class Contract {
  /**
   * Abstraction over an Ethereum contract
   *
   * @param {RpcTransport} transport
   * @param {String}       address `0x` prefixed contract address
   */
  constructor (transport, address) {
    this._address = address;
    this._transport = transport;
    this._methods = new Map();
  }

  /**
   * Register a function. This allows you to call contract functions like
   * regular JS functions:
   *
   * ```
   * contract.register('foo', 'uint256');
   * contract.foo(100);
   * ```
   *
   * @param {String}    name  of the function
   * @param {...String} types by their string names
   *
   * @return {Contract} `this` for chaining
   */
  register (name, ...types) {
    const method = new Method(name, types);

    this._methods.set(name, method);
    this[name] = (...args) => this._call(name, args);
    this[name].id = method.id;

    return this;
  }

  /**
   * Call into a registered contract function
   *
   * @param  {String}                         name of the function
   * @param  {Array<String|Number|BigNumber>} args strings need to be `0x` prefixed
   *
   * @return {Promise} result of `eth_call`
   */
  _call (name, args) {
    const method = this._methods.get(name);

    return this
      ._transport
      .request('eth_call', {
        to: this._address,
        data: method.data(args)
      });
  }
}

module.exports = Contract;
