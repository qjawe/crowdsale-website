// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const Koa = require('koa');
const Router = require('koa-router');
const Sale = require('./sale');

const app = new Koa();
const router = new Router();
const sale = new Sale('ws://127.0.0.1:8546/', '0x5a96e89850ea6c495017dba467643712b0cace86');

router.get('/', (ctx) => {
  console.log('Incoming request!');

  const { block, price, begin, end, status } = sale;

  ctx.body = {
    block,
    price,
    begin,
    end,
    status
  };
});

app
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000);
