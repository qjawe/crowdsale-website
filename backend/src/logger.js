// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const bunyan = require('bunyan');

const log = bunyan.createLogger({
  name: 'crowdsale-backend',
  level: 'trace'
});

module.exports = log;
