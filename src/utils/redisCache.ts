import Redis from 'ioredis';

const host = process.env.REDIS_HOST;
const password = process.env.REDIS_PASSWORD;

export const redis: Redis.Redis =
  process.env.NODE_ENV === 'test'
    ? new Redis({ db: 10, host, password })
    : new Redis({ host, password });
