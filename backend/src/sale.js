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
    this._statementHash = '0x';

    this._connector = new ParityConnector(wsUrl);
    this._contract = new Contract(this._connector.transport, contractAddress);

    const contract = this._contract;

    contract
      .register('buyin', 'uint8', 'bytes32', 'bytes32')
      .register('currentPrice')
      .register('beginTime')
      .register('BONUS_DURATION')
      .register('BONUS_SIZE')
      .register('STATEMENT_HASH')
      .register('endTime')
      .register('tokensAvailable')
      .register('tokenCap');

    this._buyinId = contract.buyin.id;

    this
      ._connector
      .on('block', (block) => this.update(block));

    Promise
      .all([
        contract.beginTime().then(hex2int),
        contract.STATEMENT_HASH(),
        contract.BONUS_DURATION().then(hex2int),
        contract.BONUS_SIZE().then(hex2int)
      ])
      .then(([begin, statementHash, bonusDuration, bonusSize]) => {
        this._begin = begin;
        this._statementHash = statementHash;
        this._bonusDuration = bonusDuration;
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

  get buyinId () {
    return this._buyinId;
  }

  get statementHash () {
    return this._statementHash;
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
