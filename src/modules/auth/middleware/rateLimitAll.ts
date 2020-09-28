/* eslint-disable no-unused-vars */
import { ApolloError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';
import { Context } from './Context';
import { redisConfig } from '../../../config/RedisConfig';
import { redis } from '../../../utils/redisCache';
import { validateKey } from '../../apiKey/middleware/checkAPIKey';

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
