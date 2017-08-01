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

    this._connector.transactionReceipt('0x25f747f1a0eec8ff7d1c3be3ab927597ee8eac56aeb9252d29ca844d055ba6d9').then(console.log);

    this._contract.event(
      'Buyin',
      {
        indexed: true,
        label: 'who',
        type: 'address'
      },
      {
        label: 'accepted',
        type: 'uint256'
      },
      {
        label: 'refund',
        type: 'uint256'
      },
      {
        label: 'price',
        type: 'uint256'
      },
      {
        label: 'bonus',
        type: 'uint256'
      }
    );
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
      const nonce = txObj.nonce.length ? buf2hex(txObj.nonce) : '0x0';

      console.log('send', address, nonce);

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

    console.log(`Sent ${sent} transactions from the queue`);
  }
}

QueueConsumer.run(config.get('nodeWs'), config.get('saleContract'));
