// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const config = require('config');
const Koa = require('koa');
const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const cors = require('kcors');
const Sale = require('./sale');
// const redis = require('./redis');
const EthereumTx = require('ethereumjs-tx');
const { buf2hex, buf2big, big2hex } = require('./utils');

const app = new Koa();
const router = new Router();
const sale = new Sale(config.get('nodeWs'), config.get('saleContract'));

router.get('/address/:address', async (ctx, next) => {
  const { address } = ctx.params;
  const [ eth, participant ] = await Promise.all([
    sale.connector.balance(address),
    sale.participant(address)
  ]);

  ctx.body = {
    eth: '0x' + eth.toString(16),
    dot: '0x' + participant.value.toString(16)
  };
});

router.get('/:address/nonce', async (ctx, next) => {
  const { address } = ctx.params;

  const nonce = await sale.connector.nextNonce(address);

  ctx.body = { nonce };
});

router.get('/tx/:hash', async (ctx, next) => {
  const { hash } = ctx.params;

  const transaction = await sale.connector.getTx(hash);

  ctx.body = { transaction };
});

router.get('/chart-data', async (ctx, next) => {
  const data = await sale.getChartData();

  ctx.body = data;
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

    ctx.body = { hash: '0x', requiredEth: big2hex(requiredEth.sub(balance)) };
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
    beginTime,
    block,
    bonusDuration,
    bonusSize,
    buyinId,
    contractAddress,
    currentPrice,
    divisor,
    endTime,
    statementHash,
    status,
    tokensAvailable,
    tokenCap,
    totalAccounted,
    totalReceived
  } = sale;

  ctx.body = {
    beginTime,
    block,
    bonusDuration,
    bonusSize,
    buyinId,
    contractAddress,
    currentPrice,
    divisor,
    endTime,
    statementHash,
    status,
    tokensAvailable,
    tokenCap,
    totalAccounted,
    totalReceived
  };
});

app
  .use(bodyParser())
  .use(cors())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(4000);
