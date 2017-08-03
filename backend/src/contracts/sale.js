// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const { SecondPriceAuction } = require('../abis');
const Contract = require('../contract');
const { hex2big, hex2int } = require('../utils');

const STATICS = [
  'ERA_PERIOD',
  'DUST_LIMIT',
  'STATEMENT_HASH',
  'STATEMENT',
  'BONUS_SIZE',
  'BONUS_DURATION',
  'USDWEI',
  'DIVISOR'
];

class Sale extends Contract {
  /**
   * Abstraction over the sale contract, found here:
   * https://github.com/paritytech/second-price-auction/blob/master/src/contracts/SecondPriceAuction.sol
   *
   * @param {Object} connector  A ParityConnector
   * @param {String} address    `0x` prefixed
   */
  constructor (connector, address) {
    super(connector.transport, address, SecondPriceAuction, STATICS);

    this._connector = connector;
    this._transport = connector.transport;

    this.update()
      .catch((error) => {
        console.error(error);
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

  async update () {
    return super.update()
      .then(() => {
        console.log(`Price is ${this.currentPrice.toFormat()} wei`);
      });
  }
}

module.exports = Sale;
