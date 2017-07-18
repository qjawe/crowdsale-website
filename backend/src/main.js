// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const config = require('config');
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('kcors');
const Sale = require('./sale');
const redis = require('./redis');
const EthereumTx = require('ethereumjs-tx');
const { buf2hex, buf2big, big2hex } = require('./utils');

const app = new Koa();
const router = new Router();
const sale = new Sale(config.get('nodeWs'), config.get('saleContract'));

router.get('/:address/nonce', async (ctx, next) => {
  const { address } = ctx.params;

  const nonce = await sale.connector.nextNonce(address);

  ctx.body = { nonce };
});

router.post('/tx', async (ctx, next) => {
  const { tx } = ctx.request.body;

  const txBuf = Buffer.from(tx.substring(2), 'hex');
  const txObj = new EthereumTx(txBuf);
  // const to = buf2hex(txObj.to);
  const from = buf2hex(txObj.from);
  const value = buf2big(txObj.value);
  // const data = buf2hex(txObj.data);
  const gasPrice = buf2big(txObj.gasPrice);
  const gasLimit = buf2big(txObj.gasLimit);

  const requiredEth = value.add(gasPrice.mul(gasLimit));
  const balance = await sale.connector.balance(from);

  if (balance.cmp(requiredEth) < 0) {
    console.log('TODO: Queue tx for later send!');

    ctx.body = { hash: '0x', requiredEth: big2hex(requiredEth) };
    return;
  }

  try {
    const hash = await sale.connector.sendTx(tx);

    ctx.body = { hash };
  } catch (error) {
    ctx.status = 400;
    ctx.body = error.message;
    ctx.app.emit('error', error, ctx);
  }
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
