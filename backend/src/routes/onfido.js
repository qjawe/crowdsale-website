// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const Router = require('koa-router');

const Onfido = require('../onfido');
const Recaptcha = require('../recaptcha');
const store = require('../store');
const { error } = require('./utils');

function get () {
  const router = new Router({
    prefix: '/onfido'
  });

  router.post('/webhook', async (ctx, next) => {
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

  router.get('/:address', async (ctx, next) => {
    const { address } = ctx.params;
    const { pending, success } = await store.onfido.get(address);

    ctx.body = { pending, success };
  });

  router.post('/:applicantId/check', async (ctx, next) => {
    const { applicantId } = ctx.params;
    const { address } = ctx.request.body;
    const result = await Onfido.createCheck(applicantId, address);

    ctx.body = result;
  });

  router.post('/', async (ctx, next) => {
    const { country, firstName, lastName, stoken } = ctx.request.body;

    await Recaptcha.validate(stoken);

    const { applicantId, sdkToken } = await Onfido.createApplicant({ country, firstName, lastName });

    ctx.body = { applicantId, sdkToken };
  });

  return router;
}

module.exports = get;
