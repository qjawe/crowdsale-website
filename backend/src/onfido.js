// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const config = require('config');
const qs = require('qs');
const fetch = require('node-fetch');

const { token } = config.get('onfido');

const ONFIDO_STATUS = {
  UNKOWN: 'unkown',
  CREATED: 'created',
  PENDING: 'pending',
  COMPLETED: 'completed'
};

const ONFIDO_URL_REGEX = /applicants\/([a-z0-9-]+)\/checks\/([a-z0-9-]+)$/i;

async function _call (endpoint, method = 'GET', data = {}) {
  const body = method === 'POST'
    ? qs.stringify(data, { arrayFormat: 'brackets', encode: false })
    : '';

  const headers = {
    Authorization: `Token token=${token}`
  };

  if (method === 'POST') {
    headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
  }

  return fetch(`https://api.onfido.com/v2${endpoint}`, {
    method,
    headers,
    body
  })
  .then(async (r) => {
    const rc = r.clone();

    try {
      const json = await r.json();

      return json;
    } catch (error) {
      return rc.text();
    }
  })
  .then((data) => {
    if (data && data.error) {
      console.warn('onfido error', data.error);
      throw new Error(data.error.message);
    }

    return data;
  });
}

async function getCheck (applicantId, checkId) {
  return await _call(`/applicants/${applicantId}/checks/${checkId}`, 'GET');
}

// async function getReports (checkId) {
//   return await _call(`/checks/${checkId}/reports`, 'GET');
// }

async function checkStatus (applicantId, checkId) {
  const { status, result } = await getCheck(applicantId, checkId);

  const pending = status === 'in_progress';
  const valid = status === 'complete' && result === 'clear';

  return { pending, valid };
}

async function createCheck (applicantId, address) {
  const check = await _call(`/applicants/${applicantId}/checks`, 'POST', {
    type: 'express',
    reports: [
      { name: 'document' }
      // { name: 'facial_similarity' }
    ],
    tags: [ `address:${address}` ]
  });

  return { checkId: check.id };
}

async function createApplicant ({ country, firstName, lastName }) {
  const applicant = await _call('/applicants', 'POST', {
    country,
    first_name: firstName,
    last_name: lastName
  });

  const sdk = await _call('/sdk_token', 'POST', {
    applicant_id: applicant.id,
    referrer: '*://*/*'
  });

  return { applicantId: applicant.id, sdkToken: sdk.token };
}

/**
 * Verify an URL onfido check and trigger the transaction to the
 * Certifier contract if the check is successful
 *
 * @param {String} href in format: https://api.onfido.com/v2/applicants/<applicant-id>/checks/<check-id>
 */
async function verify (href) {
  if (!ONFIDO_URL_REGEX.test(href)) {
    throw new Error(`wrong onfido URL: ${href}`);
  }

  const [, applicantId, checkId] = ONFIDO_URL_REGEX.exec(href);
  const status = await checkStatus(applicantId, checkId);

  if (status.pending) {
    throw new Error(`onfido check is still pending (${href})`);
  }

  const { tags } = await getCheck(applicantId, checkId);
  const addressTag = tags.find((tag) => /address/.test(tag));

  if (!addressTag) {
    throw new Error(`could not find an address for this applicant check (${applicantId}/${checkId})`);
  }

  const address = addressTag.replace(/^address:/, '');

  return { address, valid: status.valid };
}

module.exports = {
  checkStatus,
  createApplicant,
  createCheck,
  getCheck,
  verify,

  ONFIDO_STATUS
};
