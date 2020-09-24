import Redis from 'ioredis';
export const redis: Redis.Redis =
  process.env.NODE_ENV === 'test' ? new Redis({ db: 10 }) : new Redis();
