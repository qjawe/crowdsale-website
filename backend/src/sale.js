// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const ParityConnector = require('./parity');
const Contract = require('./contract');
const { hex2int } = require('./utils');

class Sale {
  constructor (wsUrl, contractAddress) {
    this._block = 0;
    this._current = 0;
    this._beginTime = 0;
    this._endTime = 0;

    this._connector = new ParityConnector(wsUrl);
    this._contract = new Contract(this._connector.transport, contractAddress);

    this
      ._contract
      .register('currentPrice')
      .register('beginTime')
      .register('endTime');

    this
      ._connector
      .on('block', (block) => this.update(block));

    Promise
      .all([
        this._contract.beginTime(),
        this._contract.endTime()
      ])
      .then(([begin, end]) => {
        this._beginTime = hex2int(begin);
        this._endTime = hex2int(end);
      });
  }

  async update (block) {
    this._block = block;
    this._price = hex2int(await this._contract.currentPrice());

    console.log(`Block ${block}, price is ${this._price}`);
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
    return this._beginTime;
  }

  get end () {
    return this._endTime;
  }
}

module.exports = Sale;
