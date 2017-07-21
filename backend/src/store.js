// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const chunk = require('lodash.chunk');
const redis = require('./redis');
const { big2hex, hex2big } = require('./utils');

/**
 * Add transaction to the queue
 *
 * @param  {String}    address     `0x` prefixed
 * @param  {String}    tx          `0x` prefixed signed transaction
 * @param  {BigNumber} requiredEth Required ETH calculated from value + gas
 *
 * @return {Promise<String>} resolves to 'OK' on success
 */
async function addToQueue (address, tx, requiredEth) {
  return redis.hset('queue', address, JSON.stringify({
    tx,
    required: big2hex(requiredEth)
  }));
}

/**
 * Iterate over all transactions in the queue. This will sequentially
 * perform any asynchronous callbacks to avoid overloading the Parity
 * node with requests.
 *
 * @param  {Function} callback takes 3 arguments:
 *                             - address (`String`)
 *                             - tx (`String`)
 *                             - requiredEth (`BigNumber`),
 *                             will `await` for any returned `Promise`.
 *
 * @return {Promise} resolves after all transactions have been processed
 */
async function withQueue (callback) {
  let next = 0;

  do {
    // Get a batch of responses
    const [cursor, res] = await redis.hscan('queue', next);

    next = Number(cursor);

    // `res` is an array of `[key, value, key, value, ...]`
    for (const [address, json] of chunk(res, 2)) {
      const { tx, required } = JSON.parse(json);

      await callback(address, tx, hex2big(required));
    }

  // `next` will be `0` at the end of iteration, explained here:
  // https://redis.io/commands/scan
  } while (next !== 0);
}

/**
 * Store a confirmation of the transaction
 *
 * @param  {String} address `0x` prefixed
 * @param  {String} nonce   `0x` prefixed hex encoded int
 * @param  {String} hash    `0x` prefixed hash
 * @param  {String} value   `0x` prefixed integer value contributed (refunds subtracted)
 *
 * @return {Promise<String>} resolves to 'OK' on success
 */
async function confirmTx (address, nonce, hash, value) {
  await redis.hdel('queue', address);

  return redis.set(`done:${address}:${nonce}`, JSON.stringify({
    hash,
    value: big2hex(value)
  }));
}

/**
 * Store a rejection of the transaction
 *
 * @param  {String} address `0x` prefixed
 * @param  {String} nonce   `0x` prefixed hex encoded int
 * @param  {String} reason  text description
 *
 * @return {Promise<String>} resolves to 'OK' on success
 */
async function rejectTx (address, nonce, reason) {
  await redis.hdel('queue', address);

  return redis.set(`done:${address}:${nonce}`, JSON.stringify({
    error: reason
  }));
}

module.exports = {
  addToQueue,
  withQueue,
  confirmTx,
  rejectTx
};
