// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const keccak = require('keccak');
const BigNumber = require('bignumber.js');

function validateHex (hex) {
  if (typeof hex !== 'string' || hex.substring(0, 2) !== '0x') {
    throw new Error('hex must be a `0x` prefixed string');
  }
}

function hex2int (hex) {
  validateHex(hex);

  return parseInt(hex.substring(2), 16);
}

function int2hex (int) {
  return `0x${int.toString(16)}`;
}

function hex2buf (hex) {
  validateHex(hex);

  return Buffer.from(hex.substring(2), 'hex');
}

function buf2hex (buf) {
  return `0x${buf.toString('hex')}`;
}

function hex2big (hex) {
  validateHex(hex);

  return new BigNumber(hex);
}

function buf2big (buf) {
  return hex2big(buf2hex(buf));
}

// The interface is the same
const big2hex = int2hex;

function pause (time) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time);
  });
}

function padLeft (input, length) {
  if (input.length >= length) {
    return input;
  }

  return padLeft('0' + input, length);
}

function toChecksumAddress (_address) {
  const address = (_address || '').toLowerCase();

  const hashBuffer = keccak('keccak256')
              .update(Buffer.from(address.slice(-40)))
              .digest();

  const hash = buf2hex(hashBuffer);
  let result = '0x';

  for (let n = 0; n < 40; n++) {
    result = `${result}${parseInt(hash[n], 16) > 7 ? address[n + 2].toUpperCase() : address[n + 2]}`;
  }

  return result;
}

module.exports = {
  hex2int,
  int2hex,
  hex2buf,
  buf2hex,
  hex2big,
  buf2big,
  big2hex,
  padLeft,
  pause,
  toChecksumAddress
};
