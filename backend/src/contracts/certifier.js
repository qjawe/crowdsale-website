// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const { MultiCertifier } = require('../abis');
const Contract = require('../api/contract');

class Certifier extends Contract {
  /**
   * Abstraction over the certifier contract, found here:
   * https://github.com/paritytech/second-price-auction/blob/master/src/contracts/MultiCertifier.sol
   *
   * @param {Object} connector  A ParityConnector
   * @param {String} address    `0x` prefixed
   */
  constructor (connector, address) {
    super(connector, address, MultiCertifier);
  }

  /**
   * Check if account is certified
   *
   * @param {String}  address `0x` prefixed
   *
   * @return {Promise<Boolean>}
   */
  async isCertified (address) {
    const [ certified ] = await this.methods.certified(address).get();

    return certified;
  }
}

module.exports = Certifier;
