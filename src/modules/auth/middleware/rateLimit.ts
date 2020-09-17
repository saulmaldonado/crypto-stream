import { ApolloError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';
import { redis } from '../../..';
import { Context } from './Context';

export const rateLimitAnon: (limit: number) => MiddlewareFn<Context> = (limit) => async (
  { context },
  next
) => {
  if (context.connection.context.ip) {
    const ONE_DAY = 60 * 60 * 24;

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
