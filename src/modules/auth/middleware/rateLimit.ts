import { ApolloError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';
import { redis } from '../../..';
import { Context, ContextHeaders } from './Context';

const ONE_DAY = 60 * 60 * 24;

export const rateLimitAnon: (limit: number) => MiddlewareFn<ContextHeaders> = (limit) => async (
  { context },
  next
) => {
  const { key, address } = context;
  if (!key) {
    const key = address;
    const current = await redis.incr(key);

    if (current > limit) {
      throw new ApolloError("You've reached your limit");
    } else if (current === 1) {
      await redis.expire(key, ONE_DAY);
    }
  }

  return next();
};

export const rateLimitAll: (limit: number) => MiddlewareFn<ContextHeaders> = (limit) => async (
  { context },
  next
) => {
  let { address, key } = context;

  if (!key) {
    limit /= 2;
    key = address;
  }

  const rateLimitKey = `${key} HIT ENDPOINT`;
  const current = await redis.incr(rateLimitKey);

  console.log(current);

  if (current > limit) {
    throw new ApolloError("You've reached your limit");
  } else if (current === 1) {
    await redis.expire(key, ONE_DAY);
  }

  return next();
};
