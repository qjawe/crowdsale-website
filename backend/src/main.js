// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const config = require('config');
const EthereumTx = require('ethereumjs-tx');
const EthereumUtil = require('ethereumjs-util');
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const etag = require('koa-etag');
const Router = require('koa-router');
const cors = require('kcors');

const Certifier = require('./contracts/certifier');
const Onfido = require('./onfido');
const ParityConnector = require('./parity');
const Recaptcha = require('./recaptcha');
const Sale = require('./contracts/sale');
const redis = require('./redis');

const store = require('./store');
const { buf2add, buf2hex, buf2big, big2hex, int2date } = require('./utils');

const app = new Koa();
const router = new Router();

const connector = new ParityConnector(config.get('nodeWs'));

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = err.message;
    ctx.app.emit('error', err, ctx);
  }
});

main();

function error (ctx, code = 400, body = 'Invalid request') {
  ctx.status = code;
  ctx.body = body;
}

async function main () {
  const sale = new Sale(connector, config.get('saleContract'));

  await sale.update();

  const certifier = new Certifier(connector, sale.values.certifier);

  connector.on('block', () => {
    sale.update();
  });

  router.post('/onfido-webhook', async (ctx, next) => {
    const { payload } = ctx.request.body;

    if (!payload) {
      return error(ctx);
    }

    const { resource_type: type, action, object } = payload;

    if (!type || !action || !object) {
      return error(ctx);
    }

    if (action === 'check.completed') {
      console.warn('check completed', type, object);
      await store.onfido.verify(object.href);
    }

    ctx.body = 'OK';
  });

  router.get('/onfido/:address', async (ctx, next) => {
    const { address } = ctx.params;

    try {
      const { pending, success } = await store.onfido.get(address);

      ctx.body = { pending, success };
    } catch (error) {
      ctx.status = 400;
      ctx.body = error.message;
      ctx.app.emit('error', error, ctx);
    }
  });

  router.post('/onfido/:applicantId/check', async (ctx, next) => {
    const { applicantId } = ctx.params;
    const { address } = ctx.request.body;

    try {
      const result = await Onfido.createCheck(applicantId, address);

      ctx.body = result;
    } catch (error) {
      ctx.status = 400;
      ctx.body = error.message;
      ctx.app.emit('error', error, ctx);
    }
  });

  router.post('/onfido', async (ctx, next) => {
    const { country, firstName, lastName, stoken } = ctx.request.body;

    try {
      await Recaptcha.validate(stoken);
      const { applicantId, sdkToken } = await Onfido.createApplicant({ country, firstName, lastName });

      ctx.body = { applicantId, sdkToken };
    } catch (error) {
      ctx.status = 400;
      ctx.body = error.message;
      ctx.app.emit('error', error, ctx);
    }
  });

  router.get('/chart-data', async (ctx, next) => {
    const data = await sale.getChartData();

    ctx.body = data;
  });

  router.get('/address/:address/pending', async (ctx, next) => {
    const address = ctx.params.address.toLowerCase();
    const pending = await store.getFromQueue(address);

    ctx.body = { pending };
  });

  // Signature should be the signature of the hash of the following
  // message : `delete_tx_:txHash`, eg. `delete_tx_0x123...789`
  router.delete('/address/:address/pending/:signature', async (ctx, next) => {
    const { v, r, s } = EthereumUtil.fromRpcSig(ctx.params.signature);
    const address = ctx.params.address.toLowerCase();
    const pending = await store.getFromQueue(address);

    if (!pending || !pending.hash) {
      return;
    }

    if (!EthereumUtil.isValidSignature(v, r, s)) {
      throw new Error('invalid signature');
    }

    const message = Buffer.from(`delete_tx_${pending.hash}`);
    const msgHash = EthereumUtil.hashPersonalMessage(message);
    const publicKey = EthereumUtil.ecrecover(msgHash, v, r, s);
    const signAddress = buf2add(EthereumUtil.pubToAddress(publicKey)).toLowerCase();

    if (signAddress !== address) {
      throw new Error('wrong message signature');
    }

    await store.rejectTx(address, '-1', 'cancelled by user');

    ctx.body = { result: 'ok' };
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
      return;
    }

    const from = buf2hex(txObj.from);
    const value = buf2big(txObj.value);
    const gasPrice = buf2big(txObj.gasPrice);
    const gasLimit = buf2big(txObj.gasLimit);

    const [ certified ] = await certifier.methods.certified(from).get();

    if (!certified) {
      ctx.status = 400;
      ctx.body = `${from} is not certified`;
      return;
    }

    const requiredEth = value.add(gasPrice.mul(gasLimit));
    const balance = await connector.balance(from);

    if (balance.cmp(requiredEth) < 0) {
      const hash = buf2hex(txObj.hash(true));

      await store.addToQueue(from, tx, hash, requiredEth);

      ctx.body = { hash, requiredEth: big2hex(requiredEth.sub(balance)) };
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

  router.get('/block-hash', (ctx) => {
    if (!connector.block) {
      const error = new Error('Could not fetch latest block');

      ctx.status = 500;
      ctx.body = error.message;
      return ctx.app.emit('error', error, ctx);
    }

    ctx.body = { hash: connector.block.hash };
  });

  router.get('/sale', (ctx) => {
    const {
      BONUS_DURATION,
      BONUS_SIZE,
      DIVISOR,
      STATEMENT_HASH,
      beginTime,
      tokenCap
    } = sale.values;

    ctx.body = {
      BONUS_DURATION,
      BONUS_SIZE,
      DIVISOR,
      STATEMENT_HASH,
      beginTime: int2date(beginTime),
      tokenCap
    };
  });

  router.get('/', (ctx) => {
    const extras = {
      block: connector.block,
      connected: connector.status,
      contractAddress: sale.address
    };

    const {
      currentPrice,
      endTime,
      tokensAvailable,
      totalAccounted,
      totalReceived
    } = sale.values;

    ctx.body = Object.assign({}, extras, {
      currentPrice,
      endTime: int2date(endTime),
      tokensAvailable,
      totalAccounted,
      totalReceived
    });
  });

  const { port, hostname } = config.get('http');

  app
    .use(bodyParser())
    .use(cors())
    .use(etag())
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(port, hostname);
}
