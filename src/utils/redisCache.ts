import Redis from 'ioredis';
import { redisOptions } from '../config/RedisConfig';

export const redis: Redis.Redis =
  process.env.NODE_ENV === 'test'
    ? new Redis({ db: 10, host: redisOptions.HOST })
    : new Redis({ host: redisOptions.HOST });
