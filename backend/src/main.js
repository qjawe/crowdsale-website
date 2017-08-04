// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const config = require('config');
const EthereumTx = require('ethereumjs-tx');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const etag = require('koa-etag');
const Router = require('koa-router');
const cors = require('kcors');

const Certifier = require('./contracts/certifier');
const Sale = require('./contracts/sale');
const ParityConnector = require('./parity');
const store = require('./store');
const { buf2hex, buf2big, big2hex } = require('./utils');

const app = new Koa();
const router = new Router();
const connector = new ParityConnector(config.get('nodeWs'));

main();

async function main () {
  const sale = new Sale(connector, config.get('saleContract'));

  await sale.update();

  const certifier = new Certifier(connector, sale.values.certifier);

  connector.on('block', () => {
    sale.update();
  });

  router.get('/address/:address', async (ctx, next) => {
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
      ctx.status = 400;
      ctx.body = 'Invalid transaction';
    }

    // const to = buf2hex(txObj.to);
    const from = buf2hex(txObj.from);
    const value = buf2big(txObj.value);
    // const data = buf2hex(txObj.data);
    const gasPrice = buf2big(txObj.gasPrice);
    const gasLimit = buf2big(txObj.gasLimit);

    const requiredEth = value.add(gasPrice.mul(gasLimit));
    const balance = await connector.balance(from);

    if (balance.cmp(requiredEth) < 0) {
      await store.addToQueue(from, tx, requiredEth);

      ctx.body = { hash: '0x', requiredEth: big2hex(requiredEth.sub(balance)) };
      return;
    }

    try {
      const hash = await connector.sendTx(tx);

      ctx.body = { hash };
    } catch (error) {
      ctx.status = 400;
      ctx.body = error.message;
      ctx.app.emit('error', error, ctx);
    }
  });

  router.get('/block', (ctx) => {
    ctx.body = connector.block;
  });

  router.get('/', (ctx) => {
    const extras = {};

    ctx.body = Object.assign({}, sale.values, extras);
  });

  app
    .use(bodyParser())
    .use(cors())
    .use(etag())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(4000);
}
