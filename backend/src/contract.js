// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const BigNumber = require('bignumber.js');
const keccak = require('keccak');
const { buf2hex, padLeft, toChecksumAddress } = require('./utils');

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

class Event {
  constructor (name, types) {
    const sig = keccak('keccak256')
      .update(Buffer.from(`${name}(${types.join(',')})`))
      .digest();

    this._name = name;
    this._id = buf2hex(sig);
    this._types = types || [];
  }

  get id () {
    return this._id;
  }

  parse (log) {
    const data = log.topics
      .slice(1)
      .concat(log.data.replace(/^0x/, '').match(/(.{64})/g));

    log.params = this._types.map((type, index) => {
      const value = data[index];

      if (/uint/.test(type)) {
        return new BigNumber('0x' + value);
      }

      if (type === 'address') {
        const address = '0x' + value.slice(-40);

        return toChecksumAddress(address);
      }

      return value;
    });

    return log;
  }
}

class Contract {
  constructor (transport, address) {
    this._address = address;
    this._transport = transport;

    this._methods = new Map();
    this._events = new Map();

    this.events = {};
  }

  register (name, ...types) {
    const method = new Method(name, types);

    this._methods.set(name, method);
    this[name] = (...params) => this._call(name, params);
    this[name].getCallData = (...params) => method.data(params);
    this[name].id = method.id;

    return this;
  }

  registerEvent (name, ...types) {
    const event = new Event(name, types);

    this._events.set(name, event);
    this.events[name] = { id: event.id };
    this.events[event.id] = name;

    return this;
  }

  parseLogs (logs) {
    return logs.map((log) => {
      const eventId = log.topics[0];
      const eventName = this.events[eventId];
      const event = this._events.get(eventName);

      if (!event) {
        console.warn(`could not find an event matching ${eventId}`);
        return null;
      }

      const parsedLog = event.parse(log);

      parsedLog.name = eventName;
      return parsedLog;
    });
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

  get address () {
    return this._address;
  }
}

module.exports = Contract;
