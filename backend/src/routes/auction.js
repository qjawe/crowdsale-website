// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const Router = require('koa-router');

const { int2date } = require('../utils');

function get ({ sale, connector }) {
  const router = new Router({
    prefix: '/auction'
  });

  router.get('/chart', async (ctx, next) => {
    const data = await sale.getChartData();

    ctx.body = data;
  });

  router.get('/constants', (ctx) => {
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

  return router;
}

module.exports = get;
