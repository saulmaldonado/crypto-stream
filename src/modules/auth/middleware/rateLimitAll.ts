/* eslint-disable no-unused-vars */
import { ApolloError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';
import { Context } from './Context';
import { redisConfig } from '../../../config/RedisConfig';
import { redis } from '../../../utils/redisCache';
import { validateKey } from '../../apiKey/middleware/checkAPIKey';

export const rateLimitAll: (limit: number, guestLimit: number) => MiddlewareFn<Context> = (
  limit,
  guestLimit
) => async ({ context: { address, key } }, next) => {
  let userLimit: number = limit;

  if (!key) {
    // if unauthenticated, request address becomes the key
    key = address;
    userLimit = guestLimit;
  } else {
    await validateKey(key);
  }

  const rateLimitKey = `${key} HIT ENDPOINT`;
  const current = await redis.incr(rateLimitKey);

  if (current > userLimit) {
    throw new ApolloError("You've reached your limit");
  } else if (current === 1) {
    await redis.expire(key, redisConfig.ONE_DAY);
  }

  return next();
};
