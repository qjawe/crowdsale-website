// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const BigNumber = require('bignumber.js');
const keccak = require('keccak');
const { buf2hex } = require('./utils');

class Event {
  /**
   * Abstraction over a contract event
   *
   * @param {String}        name   event name
   * @param {Array<Object>} fields array of objects containing types, eg.:
   *                               [{
   *                                 indexed: false,
   *                                 label: 'count',
   *                                 type: 'uint256'
   *                               }]
   */
  constructor (name, fields) {
    const fieldTypes = fields.map((field) => field.type);
    const sig = keccak('keccak256')
                .update(Buffer.from(`${name}(${fieldTypes.join(',')})`))
                .digest();

    this._name = name;
    this._topic = buf2hex(sig);
    this._fields = fields;
  }

  /**
   * Event topic
   *
   * @return {String} `0x` prefixed hex-encoded 32 bytes
   */
  get topic () {
    return this._topic;
  }

  /**
   * Event fields
   *
   * @return {Array<Object>} same as on constructor
   */
  get fields () {
    return this._fields;
  }
}

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

  /**
   * Function id
   *
   * @return {String} `0x` prefixed hex-encoded 4 bytes
   */
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
    this._events = new Map();
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
   * Register a function. This allows you to call contract functions like
   * regular JS functions:
   *
   * ```
   * contract.register('foo', 'uint256');
   * contract.foo(100);
   * ```
   *
   * @param {String}    name   of the event
   * @param {...Object} fields objects containing types, eg.:
   *                                   [{
   *                                     indexed: false,
   *                                     label: 'count',
   *                                     type: 'uint256'
   *                                   }]
   *
   * @return {Contract} `this` for chaining
   */
  event (name, ...types) {
    const event = new Event(name, types);

    this._events.set(name, event);

    return this;
  }

  /**
   * Find a log event for a particular event and construct a response object
   * mapping it's values to the event's field labels.
   *
   * @param {String} name of the event
   * @param {Array}  logs array of log objects as returned from Parity
   *
   * @return {Object} constructed map of field labels to their values as
   *                  `0x` prefixed hex encoded 32-byte words.
   */
  findEvent (name, logs) {
    const event = this._events.get(name);

    const log = logs.find((log) => log.topics[0] === event.topic);

    if (!log) {
      return null;
    }

    const indexed = event.fields.filter((field) => field.indexed);
    const nonIndexed = event.fields.filter((field) => !field.indexed);
    const result = {};

    if (
      log.topics.length !== indexed.length + 1 ||
      log.data.length !== 2 + nonIndexed.length * 64
    ) {
      throw new Error('Logged event is incompatible with provided field types');
    }

    indexed.forEach(({ label }, index) => {
      result[label] = log.topics[index + 1];
    });

    nonIndexed.forEach(({ label }, index) => {
      const offset = 2 + 64 * index;

      result[label] = `0x${log.data.substring(offset, offset + 64)}`;
    });

    return result;
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
