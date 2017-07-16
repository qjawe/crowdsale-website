// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('kcors');
const Sale = require('./sale');

const app = new Koa();
const router = new Router();
const sale = new Sale('ws://127.0.0.1:8546/', '0x0F9b1129b309B29216b43Ea8a766AaeFb5324224');

router.get('/:address/nonce', async (ctx, next) => {
  const { address } = ctx.params;

  const nonce = await sale.connector.nextNonce(address);

  ctx.body = { nonce };
});

router.post('/tx', async (ctx, next) => {
  const { tx } = ctx.request.body;

  const hash = await sale.connector.sendTx(tx);

  ctx.body = { hash };
});

router.get('/', (ctx) => {
  const {
    contractAddress,
    statementHash,
    buyinId,
    block,
    price,
    begin,
    end,
    status,
    available,
    cap,
    bonusDuration,
    bonusSize
  } = sale;

  ctx.body = {
    contractAddress,
    statementHash,
    buyinId,
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
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(4000);
