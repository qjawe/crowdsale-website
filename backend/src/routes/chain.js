// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const EthereumTx = require('ethereumjs-tx');
const Router = require('koa-router');

const store = require('../store');
const { buf2hex, buf2big, big2hex } = require('../utils');
const { rateLimiter, error } = require('./utils');

function get ({ sale, connector, certifier }) {
  const router = new Router({
    prefix: '/api'
  });

  router.get('/block/hash', (ctx) => {
    if (!connector.block) {
      throw new Error('Could not fetch latest block');
    }

    ctx.body = { hash: connector.block.hash };
  });

  router.get('/tx/:hash', async (ctx, next) => {
    const { hash } = ctx.params;

    const transaction = await connector.getTx(hash);

    ctx.body = { transaction };
  });

  router.post('/tx', async (ctx, next) => {
    const { tx } = ctx.request.body;

    const txBuf = Buffer.from(tx.substring(2), 'hex');
    const txObj = new EthereumTx(txBuf);

    if (!txObj.verifySignature()) {
      return error(ctx, 400, 'Invalid transaction');
    }

    const from = buf2hex(txObj.from);

    await rateLimiter(from, ctx.remoteAddress);

    const certified = await certifier.isCertified(from);

    if (!certified) {
      return error(ctx, 400, `${from} is not certified`);
    }

    const value = buf2big(txObj.value);
    const gasPrice = buf2big(txObj.gasPrice);
    const gasLimit = buf2big(txObj.gasLimit);

    const requiredEth = value.add(gasPrice.mul(gasLimit));
    const balance = await connector.balance(from);

    if (balance.cmp(requiredEth) < 0) {
      const hash = buf2hex(txObj.hash(true));

      await store.Transactions.set(from, tx, hash, requiredEth);

      ctx.body = { hash, requiredEth: big2hex(requiredEth.sub(balance)) };
      return;
    }

    const hash = await connector.sendTx(tx);

    ctx.body = { hash };
  });

  router.get('/certifier', async (ctx, next) => {
    const { address } = certifier;

    ctx.body = { certifier: address };
  });

  return router;
}

module.exports = get;
