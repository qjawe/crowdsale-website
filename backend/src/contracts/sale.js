// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const BigNumber = require('bignumber.js');
const { uniq } = require('lodash');

const { SecondPriceAuction } = require('../abis');
const Contract = require('../contract');
const { int2date } = require('../utils');

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
    super(connector, address, SecondPriceAuction, STATICS);
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

  async getChartData () {
    const logs = await this.logs([
      'Buyin',
      'PrepayBuyin',
      'Injected'
    ]);

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
        const { accepted } = log.params;

        totalAccounted = totalAccounted.add(accepted);

        return {
          totalAccounted: '0x' + totalAccounted.toString(16),
          time: log.timestamp
        };
      });
  }
}

module.exports = Sale;
