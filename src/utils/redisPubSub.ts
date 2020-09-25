import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { redisOptions } from '../config/RedisConfig';

const options: Redis.RedisOptions = {
  retryStrategy: (times) => Math.max(times * 100, 3000),
  host: redisOptions.HOST,
};

export const pubSub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});
