// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const BigNumber = require('bignumber.js');
const { uniq } = require('lodash');

const ParityConnector = require('./parity');
const Contract = require('./contract');
const { hex2big, hex2int } = require('./utils');

class Sale {
  constructor (wsUrl, contractAddress) {
    this._address = contractAddress;
    this._block = 0;
    this._current = 0;
    this._begin = 0;
    this._divisor = 1;
    this._end = 0;
    this._available = 0;
    this._cap = 0;
    this._bonusDuration = 0;
    this._bonusSize = 0;
    this._statementHash = '0x';
    this._totalReceived = 0;
    this._totalAccounted = 0;

    this._connector = new ParityConnector(wsUrl);
    this._contract = new Contract(this._connector.transport, contractAddress);

    const contract = this._contract;

    contract
      .register('buyin', 'uint8', 'bytes32', 'bytes32')
      .register('participants', 'address')
      .register('currentPrice')
      .register('beginTime')
      .register('BONUS_DURATION')
      .register('BONUS_SIZE')
      .register('DIVISOR')
      .register('STATEMENT_HASH')
      .register('endTime')
      .register('tokensAvailable')
      .register('tokenCap')
      .register('totalAccounted')
      .register('totalReceived');

    contract
      .registerEvent('Buyin', 'address', 'uint256', 'uint256', 'uint256', 'uint256')
      .registerEvent('PrepayBuyin', 'address', 'uint256', 'uint256', 'uint256')
      .registerEvent('Injected', 'address', 'uint256', 'uint256');

    this._buyinId = contract.buyin.id;

    this
      ._connector
      .on('block', (block) => this.update(block));

    Promise
      .all([
        contract.beginTime().then(hex2int),
        contract.STATEMENT_HASH(),
        contract.BONUS_DURATION().then(hex2int),
        contract.BONUS_SIZE().then(hex2int),
        contract.DIVISOR().then(hex2int)
      ])
      .then(([begin, statementHash, bonusDuration, bonusSize, divisor]) => {
        this._begin = begin;
        this._statementHash = statementHash;
        this._bonusDuration = bonusDuration;
        this._bonusSize = bonusSize;
        this._divisor = divisor;
      });
  }

  async participant (address) {
    const rawParticipant = await this._contract.participants(address);
    const cleanParticipant = rawParticipant.replace(/^0x/, '');
    const [ value, bonus ] = [
      hex2big('0x' + cleanParticipant.slice(0, 64)),
      hex2big('0x' + cleanParticipant.slice(64))
    ];

    return { value, bonus };
  }

  async update (block) {
    this._block = block;

    const contract = this._contract;
    const [ end, price, cap, available, totalReceived, totalAccounted ] = await Promise.all([
      contract.endTime().then(hex2int),
      contract.currentPrice().then(hex2int),
      contract.tokenCap().then(hex2int),
      contract.tokensAvailable().then(hex2int),
      contract.totalReceived().then(hex2int),
      contract.totalAccounted().then(hex2int)
    ]);

    this._end = end;
    this._price = price;
    this._cap = cap;
    this._available = available;
    this._totalReceived = totalReceived;
    this._totalAccounted = totalAccounted;

    console.log(`Block ${block.number}, price is ${this._price}`);
  }

  async getChartData () {
    const contract = this._contract;
    const topics = [ [
      contract.events.Buyin.id,
      contract.events.PrepayBuyin.id,
      contract.events.Injected.id
    ] ];

    const options = {
      address: this.contractAddress,
      fromBlock: '0x0',
      toBlock: 'latest',
      topics
    };

    const rawLogs = await this.connector.getLogs(options);
    const logs = contract.parseLogs(rawLogs);

    const blockNumbers = uniq(logs.map((log) => log.blockNumber));
    const blocks = await Promise.all(blockNumbers.map((bn) => this.connector.getBlock(bn)));

    logs.forEach((log) => {
      const bnIndex = blockNumbers.indexOf(log.blockNumber);
      const block = blocks[bnIndex];

      log.timestamp = hex2int(block.timestamp);
    });

    let totalAccounted = new BigNumber(0);

    return logs
      .sort((logA, logB) => logA.timestamp - logB.timestamp)
      .map((log) => {
        const value = log.params[1];

        totalAccounted = totalAccounted.add(value);

        return {
          totalAccounted: '0x' + totalAccounted.toString(16),
          time: log.timestamp
        };
      });
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

  get divisor () {
    return this._divisor;
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

  get totalReceived () {
    return this._totalReceived;
  }

  get totalAccounted () {
    return this._totalAccounted;
  }
}

module.exports = Sale;
