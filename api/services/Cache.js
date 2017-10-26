'use strict';

if (!sails.config.connections.redis) {
  sails.log.error('Redis Config dose not exists!!');
  process.exit(1);
}

var Redis = require('ioredis');
var redis = new Redis({
  host: sails.config.connections.redis.host,
  port: sails.config.connections.redis.port,
  password: sails.config.connections.redis.password
});

module.exports = {
  set: function(key, value, expire, callback) {
    if (expire) {
      redis.setex(key, expire, value, callback);
    } else {
      redis.set(key, value, callback);
    }
  },
  get: function(key, callback) {
    redis.get(key, callback);
  },
  exists: function(key, callback) {
    redis.exists(key, callback);
  },
  del: function(key) {
    redis.del(key);
  },
  incr: function(key) {
    redis.incr(key);
  },
  decr: function(key) {
    redis.decr(key);
  }
};
