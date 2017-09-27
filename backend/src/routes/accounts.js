// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const Router = require('koa-router');

const { rateLimiter } = require('./utils');
const store = require('../store');

function get ({ sale, connector, certifier }) {
  const router = new Router({
    prefix: '/api/accounts'
  });

  router.get('/:address', async (ctx, next) => {
    const { address } = ctx.params;

    await rateLimiter(address, ctx.remoteAddress);

    const [ eth, [ value ], certified ] = await Promise.all([
      connector.balance(address),
      sale.methods.participants(address).get(),
      certifier.isCertified(address)
    ]);

    ctx.body = {
      certified,
      eth: '0x' + eth.toString(16),
      accounted: '0x' + value.toString(16)
    };
  });

  router.get('/:address/nonce', async (ctx, next) => {
    const { address } = ctx.params;

    await rateLimiter(address, ctx.remoteAddress);

    const nonce = await connector.nextNonce(address);

    ctx.body = { nonce };
  });

  router.get('/:address/pending', async (ctx, next) => {
    const address = ctx.params.address.toLowerCase();

    await rateLimiter(address, ctx.remoteAddress);

    const pending = await store.Transactions.get(address);

    ctx.body = { pending };
  });

  return router;
}

module.exports = get;
