const config = require('config');
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient(config.get('redis'));

client.on('error', function (err) {
  console.error('Redis error', err);
});

module.exports = client;
