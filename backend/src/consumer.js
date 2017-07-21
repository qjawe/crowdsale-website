// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const config = require('config');
const store = require('./store');
const ParityConnector = require('./parity');
const Contract = require('./contract');
const EthereumTx = require('ethereumjs-tx');
const { buf2hex, buf2big, big2hex } = require('./utils');

class QueueConsumer {
  static run (wsUrl, contractAddress) {
    return new QueueConsumer(wsUrl, contractAddress);
  }

  constructor (wsUrl, contractAddress) {
    this._connector = new ParityConnector(wsUrl);
    this._contract = new Contract(this._connector.transport, contractAddress);
    this._connector.on('block', () => this.update());
  }

  async update () {
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
      const nonce = buf2hex(txObj.nonce);

      console.log('send', address, nonce);

      try {
        const hash = await connector.sendTx(tx);

        // TODO: get the value minus refunds
        await store.confirmTx(address, nonce, hash, '0x');
      } catch (err) {
        await store.rejectTx(address, nonce, err.message);
      }

      sent += 1;
    });

    console.log(`Sent ${sent} transactions from the queue`);
  }
}

QueueConsumer.run(config.get('nodeWs'), config.get('saleContract'));
