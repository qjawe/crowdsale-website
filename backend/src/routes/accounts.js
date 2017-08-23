// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const EthereumUtil = require('ethereumjs-util');
const Router = require('koa-router');

const store = require('../store');
const { buf2add } = require('../utils');
const { error } = require('./utils');

function get ({ sale, connector, certifier }) {
  const router = new Router({
    prefix: '/accounts'
  });

  router.get('/:address', async (ctx, next) => {
    const { address } = ctx.params;
    const [ eth, [ value ], [ certified ] ] = await Promise.all([
      connector.balance(address),
      sale.methods.participants(address).get(),
      certifier.methods.certified(address).get()
    ]);

    ctx.body = {
      certified,
      eth: '0x' + eth.toString(16),
      accounted: '0x' + value.toString(16)
    };
  });

  router.get('/:address/nonce', async (ctx, next) => {
    const { address } = ctx.params;

    const nonce = await connector.nextNonce(address);

    ctx.body = { nonce };
  });

  router.get('/:address/pending', async (ctx, next) => {
    const address = ctx.params.address.toLowerCase();
    const pending = await store.getFromQueue(address);

    ctx.body = { pending };
  });

  // Signature should be the signature of the hash of the following
  // message : `delete_tx_:txHash`, eg. `delete_tx_0x123...789`
  router.del('/:address/pending/:signature', async (ctx, next) => {
    const { v, r, s } = EthereumUtil.fromRpcSig(ctx.params.signature);
    const address = ctx.params.address.toLowerCase();
    const pending = await store.getFromQueue(address);

    if (!pending || !pending.hash) {
      return;
    }

    if (!EthereumUtil.isValidSignature(v, r, s)) {
      return error(ctx, 400, 'Invalid signature');
    }

    const message = Buffer.from(`delete_tx_${pending.hash}`);
    const msgHash = EthereumUtil.hashPersonalMessage(message);
    const publicKey = EthereumUtil.ecrecover(msgHash, v, r, s);
    const signAddress = buf2add(EthereumUtil.pubToAddress(publicKey)).toLowerCase();

    if (signAddress !== address) {
      return error(ctx, 400, 'Wrong message signature');
    }

    await store.rejectTx(address, '-1', 'cancelled by user');

    ctx.body = { result: 'ok' };
  });

  return router;
}

module.exports = get;
