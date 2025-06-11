const Redis = require('ioredis');
const { REDIS_URL } = process.env;

const redis = new Redis(REDIS_URL, {
  retryStrategy: (times) => Math.min(times * 50, 2000),
  maxRetriesPerRequest: 3
});

module.exports = redis; 