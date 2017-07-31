// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const BigNumber = require('bignumber.js');
const { uniq } = require('lodash');

const ParityConnector = require('./parity');
const Contract = require('./contract');
const { hex2big, hex2bool, int2date, hex2int, toChecksumAddress } = require('./utils');

class Sale {
  constructor (wsUrl, contractAddress) {
    this._address = contractAddress;
    this._beginTime = new Date();
    this._block = {};
    this._bonusDuration = '0x0';
    this._bonusSize = '0x0';
    this._certifier = null;
    this._currentPrice = '0x0';
    this._divisor = '0x1';
    this._endTime = new Date();
    this._tokensAvailable = '0x0';
    this._tokenCap = '0x0';
    this._statementHash = '0x';
    this._totalReceived = '0x0';
    this._totalAccounted = '0x0';

    this._connector = new ParityConnector(wsUrl);
    this._contract = new Contract(this._connector.transport, contractAddress);

    const contract = this._contract;

    contract
      .register('buyin', 'uint8', 'bytes32', 'bytes32')
      .register('participants', 'address')
      .register('certifier')
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
        contract.beginTime().then(hex2int).then(int2date),
        contract.certifier(),
        contract.STATEMENT_HASH(),
        contract.BONUS_DURATION(),
        contract.BONUS_SIZE(),
        contract.DIVISOR()
      ])
      .then(([beginTime, _certifierAddress, statementHash, bonusDuration, bonusSize, divisor]) => {
        this._beginTime = beginTime;
        this._statementHash = statementHash;
        this._bonusDuration = bonusDuration;
        this._bonusSize = bonusSize;
        this._divisor = divisor;

        const certifierAddress = toChecksumAddress('0x' + _certifierAddress.slice(-40));

        this._certifier = new Contract(this._connector.transport, certifierAddress);
        this._certifier
          .register('certified', 'address');
      });
  }

  async certified (who) {
    if (!this._certifier) {
      return false;
    }

    const certified = await this._certifier.certified(who);

    return hex2bool(certified);
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
    block.timestamp = int2date(block.timestamp);

    this._block = block;

    const contract = this._contract;
    const [
      endTime,
      currentPrice,
      tokenCap,
      tokensAvailable,
      totalReceived,
      totalAccounted
    ] = await Promise.all([
      contract.endTime().then(hex2int).then(int2date),
      contract.currentPrice(),
      contract.tokenCap(),
      contract.tokensAvailable(),
      contract.totalReceived(),
      contract.totalAccounted()
    ]);

    this._endTime = endTime;
    this._currentPrice = currentPrice;
    this._tokenCap = tokenCap;
    this._tokensAvailable = tokensAvailable;
    this._totalReceived = totalReceived;
    this._totalAccounted = totalAccounted;

    console.log(`Block ${block.number}, price is ${hex2int(currentPrice)}`);
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

      log.timestamp = int2date(block.timestamp);
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

  get beginTime () {
    return this._beginTime;
  }

  get block () {
    return this._block;
  }

  get bonusDuration () {
    return this._bonusDuration;
  }

  get bonusSize () {
    return this._bonusSize;
  }

  get buyinId () {
    return this._buyinId;
  }

  get connector () {
    return this._connector;
  }

  get contractAddress () {
    return this._address;
  }

  get currentPrice () {
    return this._currentPrice;
  }

  get divisor () {
    return this._divisor;
  }

  get endTime () {
    return this._endTime;
  }

  get statementHash () {
    return this._statementHash;
  }

  get status () {
    return this._connector.status;
  }

  get tokensAvailable () {
    return this._tokensAvailable;
  }

  get tokenCap () {
    return this._tokenCap;
  }

  get totalReceived () {
    return this._totalReceived;
  }

  get totalAccounted () {
    return this._totalAccounted;
  }
}

module.exports = Sale;
