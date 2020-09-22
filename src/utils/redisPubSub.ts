import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

const options: Redis.RedisOptions = {
  retryStrategy: (times) => Math.max(times * 100, 3000),
};

export const pubSub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});
