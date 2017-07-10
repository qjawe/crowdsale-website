'use strict';

const RpcTransport = require('./transport');
const { hex2int } = require('./utils');
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
      .subscribe('eth_blockNumber')
      .forEach((result) => {
        this.emit('block', hex2int(result));
      });
  }

  /**
   * Direct access to the underlying transport.
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
