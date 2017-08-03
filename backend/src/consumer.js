// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const config = require('config');
const store = require('./store');
const ParityConnector = require('./parity');
const EthereumTx = require('ethereumjs-tx');
const { SaleContract } = require('./contracts');
const { buf2hex } = require('./utils');

class QueueConsumer {
  static run (wsUrl, contractAddress) {
    return new QueueConsumer(wsUrl, contractAddress);
  }

  constructor (wsUrl, contractAddress) {
    this._updateLock = false;
    this._connector = new ParityConnector(wsUrl);
    this._contract = new SaleContract(this._connector.transport, contractAddress);
    this._connector.on('block', () => this.update());
  }

  async update () {
    if (this._updateLock) {
      return;
    }

    this._updateLock = true;

    console.log('New block, checking queue...');

    const connector = this._connector;

    let sent = 0;

    await store.withQueue(async (address, tx, required) => {
      const balance = await connector.balance(address);

      if (balance.lt(required)) {
        return;
      }

      const txBuf = Buffer.from(tx.substring(2), 'hex');
      const txObj = new EthereumTx(txBuf);
      const nonce = txObj.nonce.length ? buf2hex(txObj.nonce) : '0x0';

      try {
        const hash = await connector.sendTx(tx);
        const { logs } = await connector.transactionReceipt(hash);
        const { accepted } = this._contract.findEvent('Buyin', logs);

        await store.confirmTx(address, nonce, hash, accepted);
      } catch (err) {
        await store.rejectTx(address, nonce, err.message);
      }

      sent += 1;
    });

    this._updateLock = false;

    console.log(`Sent ${sent} transactions from the queue`);
  }
}

QueueConsumer.run(config.get('nodeWs'), config.get('saleContract'));
