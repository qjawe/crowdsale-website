// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const ParityConnector = require('./parity');
const Contract = require('./contract');
const { hex2int } = require('./utils');

class Sale {
  constructor (wsUrl, contractAddress) {
    this._address = contractAddress;
    this._block = 0;
    this._current = 0;
    this._begin = 0;
    this._end = 0;
    this._available = 0;
    this._cap = 0;
    this._bonusDuration = 0;
    this._bonusSize = 0;

    this._connector = new ParityConnector(wsUrl);
    this._contract = new Contract(this._connector.transport, contractAddress);

    this
      ._contract
      .register('currentPrice')
      .register('beginTime')
      .register('BONUS_DURATION')
      .register('BONUS_SIZE')
      .register('endTime')
      .register('tokensAvailable')
      .register('tokenCap');

    this
      ._connector
      .on('block', (block) => this.update(block));

    this
      ._contract
      .beginTime()
      .then(hex2int)
      .then((begin) => {
        this._begin = begin;
      });

    this
      ._contract
      .BONUS_DURATION()
      .then(hex2int)
      .then((bonusDuration) => {
        this._bonusDuration = bonusDuration;
      });

    this
      ._contract
      .BONUS_SIZE()
      .then(hex2int)
      .then((bonusSize) => {
        this._bonusSize = bonusSize;
      });
  }

  async update (block) {
    this._block = block;

    const contract = this._contract;
    const [end, price, cap, available] = await Promise.all([
      contract.endTime().then(hex2int),
      contract.currentPrice().then(hex2int),
      contract.tokenCap().then(hex2int),
      contract.tokensAvailable().then(hex2int)
    ]);

    this._end = end;
    this._price = price;
    this._cap = cap;
    this._available = available;

    console.log(`Block ${block.number}, price is ${this._price}`);
  }

  get connector () {
    return this._connector;
  }

  get contractAddress () {
    return this._address;
  }

  get status () {
    return this._connector.status;
  }

  get block () {
    return this._block;
  }

  get price () {
    return this._price;
  }

  get begin () {
    return this._begin;
  }

  get end () {
    return this._end;
  }

  get available () {
    return this._available;
  }

  get cap () {
    return this._cap;
  }

  get bonusDuration () {
    return this._bonusDuration;
  }

  get bonusSize () {
    return this._bonusSize;
  }
}

module.exports = Sale;
