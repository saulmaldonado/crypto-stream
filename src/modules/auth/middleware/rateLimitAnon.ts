/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import { ApolloError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';
import { Context } from './Context';
import { redis } from '../../../utils/redisCache';
import { redisConfig } from '../../../config/RedisConfig';

export const rateLimitAnon: (limit: number) => MiddlewareFn<Context> = (limit) => async (
  { context: { address, key } },
  next
) => {
  if (!key) {
    const current = await redis.incr(address);

    if (current > limit) {
      throw new ApolloError("You've reached your limit");
    } else if (current === 1) {
      await redis.expire(address, redisConfig.ONE_DAY);
    }
  }

  return next();
};
