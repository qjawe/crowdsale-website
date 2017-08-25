// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const Router = require('koa-router');

const Onfido = require('../onfido');
const Recaptcha = require('../recaptcha');
const store = require('../store');
const { error, verifySignature } = require('./utils');

const { ONFIDO_STATUS } = Onfido;

function get ({ certifier }) {
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
      console.warn('[WEBHOOK] Check completed', object.href);
      await store.Onfido.push(object.href);
    }

    ctx.body = 'OK';
  });

  /**
   * Get the current status of Onfido certification
   * for the given address.
   *
   * The status can be unkown, created, pending or completed.
   * The result is set if the status is completed, whether to
   * success or fail.
   */
  router.get('/:address', async (ctx, next) => {
    const { address } = ctx.params;
    const stored = await store.Onfido.get(address) || {};

    if (!stored.status) {
      stored.status = ONFIDO_STATUS.UNKOWN;
    }

    const { status, result } = stored;

    ctx.body = { status, result };
  });

  router.post('/:address/applicant', async (ctx, next) => {
    const { address } = ctx.params;
    const { country, firstName, lastName, signature, stoken } = ctx.request.body;

    await Recaptcha.validate(stoken);

    try {
      const message = `create_onfido_${firstName}.${lastName}@${country}`;

      verifySignature(address, message, signature);
    } catch (err) {
      return error(ctx, 400, err.message);
    }

    const stored = await store.Onfido.get(address);
    let sdkToken = null;
    let applicantId = null;

    // Create a new applicant if none stored
    if (!stored || !stored.applicantId) {
      const result = await Onfido.createApplicant({ country, firstName, lastName });

      sdkToken = result.sdkToken;
      applicantId = result.applicantId;

    // Otherwise, update the existing applicant
    } else {
      applicantId = stored.applicantId;

      const result = await Onfido.updateApplicant(applicantId, { country, firstName, lastName });

      sdkToken = result.sdkToken;
    }

    // Store the applicant id in Redis
    await store.Onfido.set(address, { status: ONFIDO_STATUS.CREATED, applicantId });

    ctx.body = { sdkToken };
  });

  router.post('/:address/check', async (ctx, next) => {
    const { address } = ctx.params;
    const stored = await store.Onfido.get(address);

    if (!stored || stored.status !== ONFIDO_STATUS.CREATED || !stored.applicantId) {
      return error(ctx, 400, 'No application has been created for this address');
    }

    const { applicantId } = stored;
    const { checkId } = await Onfido.createCheck(applicantId, address);

    // Store the applicant id in Redis
    await store.Onfido.set(address, { status: ONFIDO_STATUS.PENDING, applicantId, checkId });

    ctx.body = { result: 'ok' };
  });

  return router;
}

module.exports = get;
