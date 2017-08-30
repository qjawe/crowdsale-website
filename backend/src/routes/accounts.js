// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const Router = require('koa-router');

const store = require('../store');
const { error, verifySignature } = require('./utils');

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
    const pending = await store.Transactions.get(address);

    ctx.body = { pending };
  });

  // Signature should be the signature of the hash of the following
  // message : `delete_tx_:txHash`, eg. `delete_tx_0x123...789`
  router.del('/:address/pending/:signature', async (ctx, next) => {
    const { address, signature } = ctx.params;

    try {
      const pending = await store.Transactions.get(address);

      if (!pending || !pending.hash) {
        throw new Error('No pending transaction to delete');
      }

      verifySignature(address, `delete_tx_${pending.hash}`, signature);
    } catch (err) {
      return error(ctx, 400, err.message);
    }

    await store.Transactions.reject(address, '-1', 'cancelled by user');
    ctx.body = { result: 'ok' };
  });

  return router;
}

module.exports = get;
