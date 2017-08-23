// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const EthereumUtil = require('ethereumjs-util');

const { buf2add } = require('../utils');

function error (ctx, code = 400, body = 'Invalid request') {
  ctx.status = code;
  ctx.body = body;
}

function verifySignature (address, message, signature) {
  const { v, r, s } = EthereumUtil.fromRpcSig(signature);

  if (!EthereumUtil.isValidSignature(v, r, s)) {
    throw new Error('Invalid signature');
  }

  const messageBuf = Buffer.from(message);
  const msgHash = EthereumUtil.hashPersonalMessage(messageBuf);
  const publicKey = EthereumUtil.ecrecover(msgHash, v, r, s);
  const signAddress = buf2add(EthereumUtil.pubToAddress(publicKey)).toLowerCase();

  if (signAddress !== address.toLowerCase()) {
    throw new Error('Wrong message signature');
  }
}

module.exports = {
  error,
  verifySignature
};
