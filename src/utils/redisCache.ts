import Redis from 'ioredis';

const host = process.env.REDIS_HOST;

export const redis: Redis.Redis =
  process.env.NODE_ENV === 'test' ? new Redis({ db: 10, host }) : new Redis({ host });
