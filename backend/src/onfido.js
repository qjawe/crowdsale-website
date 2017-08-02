const config = require('config');
const qs = require('qs');
const fetch = require('node-fetch');

const { token } = config.get('onfido');

async function _call (endpoint, method, data = {}) {
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
  .then((r) => r.json())
  .then((data) => {
    if (data && data.error) {
      console.warn('onfido error', data.error);
      throw new Error(data.error.message);
    }

    return data;
  });
}

async function checkStatus (applicantId, checkId) {
  const { status, result } = await _call(`/applicants/${applicantId}/checks/${checkId}`, 'GET');

  const pending = status === 'in_progress';
  const valid = status === 'complete' && result === 'clear';

  return { pending, valid };
}

async function checkApplicant (applicantId) {
  const check = await _call(`/applicants/${applicantId}/checks`, 'POST', {
    type: 'express',
    reports: [
      { name: 'document' }
      // { name: 'facial_similarity' }
    ]
  });

  return { id: check.id };
}

async function createApplicant ({ firstName, lastName }) {
  const applicant = await _call('/applicants', 'POST', {
    first_name: firstName,
    last_name: lastName
  });

  const sdk = await _call('/sdk_token', 'POST', {
    applicant_id: applicant.id,
    referrer: '*://*/*'
  });

  return { applicantId: applicant.id, sdkToken: sdk.token };
}

module.exports = {
  checkApplicant,
  checkStatus,
  createApplicant
};
