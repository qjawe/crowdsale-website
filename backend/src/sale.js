// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const ParityConnector = require('./parity');
const { SaleContract, CertifierContract } = require('./contracts');
const { hex2big, hex2int } = require('./utils');

class Sale {
  /**
   * Abstraction over the sale contract, found here:
   * https://github.com/paritytech/second-price-auction/blob/master/src/contracts/SecondPriceAuction.sol
   *
   * @param {String} wsUrl           including protocol, eg.: ws://example.com:5555/
   * @param {String} contractAddress `0x` prefixed
   */
  constructor (wsUrl, contractAddress) {
    this._address = contractAddress;
    this._block = 0;
    this._current = 0;
    this._begin = 0;
    this._end = 0;
    this._available = '0x0';
    this._cap = '0x0';
    this._bonusDuration = 0;
    this._bonusSize = 0;
    this._statementHash = '0x';
    this._totalReceived = 0;

    this._connector = new ParityConnector(wsUrl);
    this._contract = new SaleContract(this._connector.transport, contractAddress);

    const contract = this._contract;

    this._certifier = contract
      .certifier()
      .then((hex) => {
        const certifierAddress = '0x' + hex.slice(-40);

        return new CertifierContract(this._connector.transport, certifierAddress);
      });

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

  /**
   * Get the amount of DOTs and received bonus held by the address
   *
   * @param {String} address `0x` prefixed
   *
   * @return {Object} containing `value` and `bonus` as `BigNumber`s
   */
  async participant (address) {
    const rawParticipant = await this._contract.participants(address);
    const cleanParticipant = rawParticipant.replace(/^0x/, '');
    const [ value, bonus ] = [
      hex2big('0x' + cleanParticipant.slice(0, 64)),
      hex2big('0x' + cleanParticipant.slice(64))
    ];

    return { value, bonus };
  }

  /**
   * Check whether or not the address is certified
   *
   * @param {String} address `0x` prefixed
   *
   * @return {Boolean}
   */
  async isCertified (address) {
    const certifier = await this._certifier;

    return await certifier.certified(address).then(hex2int) === 1;
  }

  /**
   * Trigger an update of the state of the sale for the current block
   *
   * @param {Object} block object as returned from Parity JSON-RPC
   */
  async update (block) {
    this._block = block;

    const contract = this._contract;
    const [ end, price, cap, available, totalReceived ] = await Promise.all([
      contract.endTime().then(hex2int),
      contract.currentPrice(),
      contract.tokenCap(),
      contract.tokensAvailable(),
      contract.totalReceived().then(hex2int)
    ]);

    this._end = end;
    this._price = price;
    this._cap = cap;
    this._available = available;
    this._totalReceived = totalReceived;

    console.log(`Block ${block.number}, price is ${hex2int(this._price)} wei`);
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

  get totalReceived () {
    return this._totalReceived;
  }
}

module.exports = Sale;
