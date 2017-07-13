// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const Sale = require('./sale');

const app = new Koa();
const router = new Router();
const sale = new Sale('ws://127.0.0.1:8546/', '0x0F9b1129b309B29216b43Ea8a766AaeFb5324224');

app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');

  await next();
});

router.get('/:address/nonce', async (ctx, next) => {
  const { address } = ctx.params;

  const nonce = await sale.connector.nextNonce(address);

  ctx.body = { nonce };
});

router.get('/', (ctx) => {
  const { block, price, begin, end, status, available, cap, bonusDuration, bonusSize } = sale;

  ctx.body = {
    block,
    price,
    begin,
    end,
    status,
    available,
    cap,
    bonusDuration,
    bonusSize
  };
});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(4000);
