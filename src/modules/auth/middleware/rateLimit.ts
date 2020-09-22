/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
import { ApolloError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';
import { validateKey } from '../../apiKey/middleware/checkAPIKey';
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

export const rateLimitAll: (limit: number) => MiddlewareFn<Context> = (limit) => async (
  { context: { address, key } },
  next
) => {
  if (!key) {
    // unauthenticated API request are rate limited to half
    limit /= 2;
    key = address;
  } else {
    await validateKey(key);
  }

  const rateLimitKey = `${key} HIT ENDPOINT`;
  const current = await redis.incr(rateLimitKey);

  if (current > limit) {
    throw new ApolloError("You've reached your limit");
  } else if (current === 1) {
    await redis.expire(key, redisConfig.ONE_DAY);
  }

  return next();
};
