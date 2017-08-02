// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const RpcTransport = require('./transport');
const { hex2int, hex2big } = require('./utils');
const EventEmitter = require('events');

class ParityConnector extends EventEmitter {
  /**
   * Abstraction over a connection to the Parity node.
   *
   * @param {String} url to the WebSocket JSON-RPC API
   */
  constructor (url) {
    super();

    this._transport = new RpcTransport(url);
    this
      ._transport
      .subscribe('eth_getBlockByNumber', 'latest', false)
      .forEach((result) => {
        result.timestamp = hex2int(result.timestamp);
        result.number = hex2int(result.number);
        this.emit('block', result);
      });
  }

  estimateGas (options) {
    return this
      ._transport
      .request('eth_estimateGas', options);
  }

  getBlock (blockNumber) {
    return this
      ._transport
      .request('eth_getBlockByNumber', blockNumber, false);
  }

  /**
   * Get the transaction data
   *
   * @param  {String} txHash
   * @return {Promise<Object>}
   */
  getTx (txHash) {
    return this
      ._transport
      .request('eth_getTransactionByHash', txHash);
  }

  /**
   * Get next nonce for address
   *
   * @param  {String} address
   *
   * @return {Promise<String>} `0x` prefixed hex nonce
   */
  nextNonce (address) {
    return this
      ._transport
      .request('parity_nextNonce', address);
  }

  /**
   * Send a signed TX to the Parity node
   *
   * @param  {String} tx `0x` prefixed hex data
   *
   * @return {Promise<String>} `0x` prefixed tx hash
   */
  sendTx (tx) {
    return this
      ._transport
      .request('eth_sendRawTransaction', tx);
  }

  /**
   * Get the balance for address
   *
   * @param  {String} address
   *
   * @return {Promise<Number>} balance in wei.
   */
  balance (address) {
    return this
      ._transport
      .request('eth_getBalance', address)
      .then(hex2big);
  }

  getLogs (options) {
    return this
      ._transport
      .request('eth_getLogs', options);
  }

  /**
   * Direct access to the underlying transport.
   * Get next nonce for address
   *
   * @return {RpcTransport}
   * @param  {String} address
   *
   * @return {Promise<Number>} nonce
   */
  get transport () {
    return this._transport;
  }

  /**
   * Get the status of the connection.
   *
   * @return {String} connected|disconnected
   */
  get status () {
    return this._transport.connected ? 'connected' : 'disconnected';
  }
}

module.exports = ParityConnector;
