// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const Accounts = require('./accounts');
const Auction = require('./auction');
const Chain = require('./chain');
const Config = require('./config');

module.exports = function set (app, { sale, connector, certifier }) {
  [
    Accounts,
    Auction,
    Chain,
    Config
  ].forEach((Route) => {
    const instance = Route({ sale, connector, certifier });

    app.use(instance.routes(), instance.allowedMethods());
  });
};
