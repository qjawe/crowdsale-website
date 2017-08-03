// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const Contract = require('./contract');

class SaleContract extends Contract {
  /**
   * Abstraction over the sale contract with pre-registered functions and events.
   *
   * @param {RpcTransport} transport
   * @param {String}       address `0x` prefixed contract address
   */
  constructor (transport, address) {
    super(transport, address);

    this
      .register('buyin', 'uint8', 'bytes32', 'bytes32')
      .register('participants', 'address')
      .register('currentPrice')
      .register('beginTime')
      .register('BONUS_DURATION')
      .register('BONUS_SIZE')
      .register('STATEMENT_HASH')
      .register('endTime')
      .register('tokensAvailable')
      .register('tokenCap')
      .register('totalReceived')
      .register('certifier')
      .event(
        'Buyin', {
          indexed: true,
          label: 'who',
          type: 'address'
        }, {
          label: 'accepted',
          type: 'uint256'
        }, {
          label: 'refund',
          type: 'uint256'
        }, {
          label: 'price',
          type: 'uint256'
        }, {
          label: 'bonus',
          type: 'uint256'
        }
      );
  }
}

class CertifierContract extends Contract {
  /**
   * Abstraction over the sale contract with pre-registered functions and events.
   *
   * @param {RpcTransport} transport
   * @param {String}       address `0x` prefixed contract address
   */
  constructor (transport, address) {
    super(transport, address);

    this.register('certified', 'address');
  }
}

module.exports = {
  SaleContract,
  CertifierContract
};
