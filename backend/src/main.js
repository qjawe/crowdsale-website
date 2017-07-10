// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const Sale = require('./sale');

const app = new Koa();
const router = new Router();
const sale = new Sale('ws://127.0.0.1:8546/', '0x5a96e89850ea6c495017dba467643712b0cace86');

app.use((ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');

  next();
});

router.get('/', (ctx) => {
  console.log('Incoming request!');

  const { block, price, begin, end, status, available, cap } = sale;
  const current = Date.now() / 1000 | 0;

  ctx.body = {
    block,
    price,
    current,
    begin,
    end,
    status,
    available,
    cap
  };
});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(4000);
