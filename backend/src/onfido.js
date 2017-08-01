const config = require('config');
const querystring = require('querystring');
const fetch = require('node-fetch');

const { token } = config.get('onfido');

async function _call (endpoint, data = {}) {
  return fetch(`https://api.onfido.com/v2${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization': `Token token=${token}`
    },
    body: querystring.stringify(data)
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

async function createApplicant ({ firstName, lastName }) {
  const applicant = await _call('/applicants', {
    first_name: firstName,
    last_name: lastName
  });

  const sdk = await _call('/sdk_token', {
    applicant_id: applicant.id,
    referrer: '*://*/*'
  });

  return { applicantId: applicant.id, sdkToken: sdk.token };
}

module.exports = {
  createApplicant
};
