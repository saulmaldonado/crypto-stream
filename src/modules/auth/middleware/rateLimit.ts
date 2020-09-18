import { ApolloError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';
import { redis } from '../../..';
import { Context } from './Context';

const ONE_DAY = 60 * 60 * 24;

export const rateLimitAnon: (limit: number) => MiddlewareFn<Context> = (limit) => async (
  { context },
  next
) => {
  if (context.connection.context.ip) {
    const key = context.connection.context.APIKey;
    const current = await redis.incr(key);

    if (current > limit) {
      throw new ApolloError("You've reached your limit");
    } else if (current === 1) {
      await redis.expire(key, ONE_DAY);
    }
  }

  return next();
};

export const rateLimitAll: (limit: number) => MiddlewareFn<Context> = (limit) => async (
  { context },
  next
) => {
  const address = context.req.ip;

  const key = `${address} HIT ENDPOINT`;
  const current = await redis.incr(key);

  if (current > limit) {
    throw new ApolloError("You've reached your limit");
  } else if (current === 1) {
    await redis.expire(key, ONE_DAY);
  }

  return next();
};
