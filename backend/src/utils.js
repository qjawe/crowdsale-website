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

function int2date (int) {
  return new Date(int * 1000);
}

function hex2date (hex) {
  return int2date(hex2int(hex));
}

function hex2bool (hex) {
  validateHex(hex);

  return hex.slice(-1) === '1';
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

function ejs2val (value, type) {
  if (Array.isArray(value)) {
    const subtype = /^(.+)\[.*\]$/.exec(type)[1];

    return value.map((val) => ejs2val(val, subtype));
  }

  if (/(int|fixed)/.test(type)) {
    return new BigNumber('0x' + value.toString('hex'));
  }

  if (/bytes/.test(type)) {
    return '0x' + value.toString('hex');
  }

  if (/address/.test(type)) {
    return '0x' + value.toString('hex');
  }

  return value;
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
  big2hex,
  buf2big,
  buf2hex,
  ejs2val,
  hex2bool,
  hex2date,
  hex2int,
  hex2big,
  hex2buf,
  int2date,
  int2hex,
  pause,
  toChecksumAddress
};
