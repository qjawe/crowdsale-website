// Copyright Parity Technologies (UK) Ltd., 2017.
// Released under the Apache 2/MIT licenses.

'use strict';

const chunk = require('lodash.chunk');
const redis = require('./redis');
const { big2hex, hex2big } = require('./utils');

const TXS_QUEUE = 'tx:queue';
const ONFIDO_CHECKS = 'onfido:checks';
const ONFIDO_CHECKS_CHANNEL = 'onfido-checks';

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

class Onfido {
  /**
   * Get the data for the given address.
   *
   * @param  {String} address `0x` prefixed address
   *
   * @return {Promise<Object|null>}
   */
  static async get (address) {
    const data = redis.hget(ONFIDO_CHECKS, address);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error(`could not parse JSON data: ${data}`);
      return null;
    }
  }

  /**
   * Set the given data for the given address.
   *
   * @param  {String} address `0x` prefixed address
   * @param  {Object} data    Javascript Object to set
   *
   * @return {Promise}
   */
  static async set (address, data) {
    return redis.hset(ONFIDO_CHECKS, address, JSON.stringify(data));
  }

  /**
   * Subscribe to the Onfido check completions
   *
   * @param  {Function} cb   Callback function called on new
   *                         check completion
   */
  static async subscribe (cb) {
    const client = redis.client.duplicate();
    const hrefs = await redis.smembers(ONFIDO_CHECKS_CHANNEL);

    hrefs.forEach((href) => cb(href));

    client.on('message', (channel, message) => {
      if (channel !== ONFIDO_CHECKS_CHANNEL) {
        return;
      }

      cb(message);
    });

    client.subscribe(ONFIDO_CHECKS_CHANNEL);
  }

  /**
   * Push a href to onfido check API to redis and trigger a publish event,
   * so that the certifier server can process the check and trigger the
   * transaction to the certifier contract.
   *
   * @param {String} href in format: https://api.onfido.com/v2/applicants/<applicant-id>/checks/<check-id>
   */
  static async verify (href) {
    await redis.sadd(ONFIDO_CHECKS_CHANNEL, href);
    await redis.publish(ONFIDO_CHECKS_CHANNEL, href);
  }

  /**
   * Removes  a href from the Redis Onfido Check Set.
   *
   * @param {String} href
   */
  static async remove (href) {
    await redis.srem(ONFIDO_CHECKS_CHANNEL, href);
  }
}

module.exports = {
  Onfido,
  Transactions
};
