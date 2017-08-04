// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const { SecondPriceAuction } = require('../abis');
const Contract = require('../contract');
const { hex2int } = require('../utils');

const STATICS = [
  'ERA_PERIOD',
  'DUST_LIMIT',
  'STATEMENT_HASH',
  'STATEMENT',
  'BONUS_SIZE',
  'BONUS_DURATION',
  'USDWEI',
  'DIVISOR',

  'admin',
  'beginTime',
  'certifier',
  'tokenCap',
  'tokenContract',
  'treasury'
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
  }

  async update () {
    return super.update()
      .then(() => {
        console.log(`Price is ${this.values.currentPrice.toFormat()} wei`);
      })
      .catch((error) => {
        console.error(error);
      });
  }
}

module.exports = Sale;
