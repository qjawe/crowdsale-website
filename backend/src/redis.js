const config = require('config');
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient(config.get('redis'));

client.on('error', function (err) {
  console.error('Redis error', err);
});

// Promisfy & export required Redis commands
for (const func of ['get', 'set', 'hget', 'hset', 'hdel', 'hscan']) {
  exports[func] = promisify(client[func].bind(client));
}
