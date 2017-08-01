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
   * Get a transaction receipt by hash.
   *
   * Note: This will await till the transaction has been mined.
   *
   * @param  {String} hash `0x` prefixed tx hash
   *
   * @return {Promise<Object>} tx receipt: https://github.com/paritytech/parity/wiki/JSONRPC-eth-module#returns-20
   */
  transactionReceipt (hash) {
    return new Promise((resolve, reject) => {
      let attempts = 0;

      const attempt = () => {
        attempts += 1;

        this
          ._transport
          .request('eth_getTransactionReceipt', hash)
          .then((receipt) => {
            console.log('receipt.blockNumber', receipt.blockNumber);

            if (!receipt.blockNumber) {
              if (attempts >= 60) {
                reject(new Error('Exceeded allowed attempts'));
              } else {
                // Try again next block
                this.once('block', attempt);
              }

              return;
            }

            resolve(receipt);
          })
          .catch((err) => {
            if (attempts >= 10) {
              reject(err);
            } else {
              console.error('Error while getting receipt, will retry:', err.message);

              // Try again next block
              this.once('block', attempt);
            }
          });
      };

      attempt();
    });
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

  /**
   * Direct access to the underlying transport.
   * Get next nonce for address
   *
   * @return {RpcTransport}
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
