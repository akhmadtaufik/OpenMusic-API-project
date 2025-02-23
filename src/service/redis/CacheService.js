const redis = require('redis');
const process = require('process');

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER,
        port: 6379,
      },
    });

    this._client
      .connect()
      .then(() => {
        console.log('Redis client connected');
      })
      .catch((err) => {
        console.error('Redis connection error:', err);
      });

    this._client.on('error', (error) => {
      console.error('Redis operational error:', error);
    });
  }

  async set(key, value, expiration = 1800) {
    await this._client.setEx(key, expiration, JSON.stringify(value));
  }

  async get(key) {
    const data = await this._client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async delete(key) {
    await this._client.del(key);
  }
}

module.exports = CacheService;
