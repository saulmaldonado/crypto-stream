import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

const options: Redis.RedisOptions = {
  retryStrategy: (times) => Math.max(times * 100, 3000),
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASSWORD,
};

export const pubSub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});
