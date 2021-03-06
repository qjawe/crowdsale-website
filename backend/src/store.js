// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const chunk = require('lodash.chunk');
const redis = require('./redis');
const { big2hex, hex2big } = require('./utils');

const TXS_QUEUE = 'tx-queue';

class Transactions {
  /**
   * Add transaction to the queue
   *
   * @param  {String}    address     `0x` prefixed
   * @param  {String}    hash        `0x` prefixed transaction hash
   * @param  {String}    tx          `0x` prefixed signed transaction
   * @param  {BigNumber} requiredEth Required ETH calculated from value + gas
   *
   * @return {Promise<String>} resolves to 'OK' on success
   */
  static async set (address, tx, hash, requiredEth) {
    return redis.hset(TXS_QUEUE, address, JSON.stringify({
      tx,
      hash,
      required: big2hex(requiredEth)
    }));
  }

  /**
   * Get a transaction from the queue
   *
   * @param  {String} address           `0x` prefixed
   *
   * @return {Promise<null|Object>}     `null` if no entry for this address,
   *                                    or the transaction Object
   */
  static async get (address) {
    return redis.hget(TXS_QUEUE, address)
      .then((result) => {
        return result
          ? JSON.parse(result)
          : null;
      });
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
  static async scan (callback) {
    let next = 0;

    do {
      // Get a batch of responses
      const [cursor, res] = await redis.hscan(TXS_QUEUE, next);

      next = Number(cursor);

      await Promise.all(
        // `res` is an array of `[key, value, key, value, ...]`
        chunk(res, 2).map(async ([address, json]) => {
          const { tx, required } = JSON.parse(json);

          await callback(address, tx, hex2big(required));
        })
      );

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
  static async confirm (address, nonce, hash, value) {
    await redis.hdel(TXS_QUEUE, address);

    return redis.set(`done:${address}:${nonce}`, JSON.stringify({
      hash,
      value
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
  static async reject (address, nonce, reason) {
    await redis.hdel(TXS_QUEUE, address);

    return redis.set(`done:${address}:${nonce}`, JSON.stringify({
      error: reason
    }));
  }
}

module.exports = {
  Transactions
};
