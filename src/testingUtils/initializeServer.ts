import { ApolloServer } from 'apollo-server-express';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { buildSchema } from 'type-graphql';
import { createContext } from 'vm';
import { APIKeyResolver } from '../modules/apiKey/APIKey';
import { LoginResolver } from '../modules/auth/login';
import { customAuthChecker } from '../modules/auth/middleware/authChecker';
import { RegisterResolver } from '../modules/auth/register';
import { PriceResolver } from '../modules/prices/prices';
import { checkAPIKeySubscription } from '../subscriptions/middleware/APIkeys';

export const initializeServer = async (serverContext: any): Promise<ApolloServer> => {
  const options: Redis.RedisOptions = {
    retryStrategy: (times) => Math.max(times * 100, 3000),
  };

  const pubSub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options),
  });

  const schema = await buildSchema({
    resolvers: [PriceResolver, LoginResolver, APIKeyResolver, RegisterResolver],
    authChecker: customAuthChecker,
    pubSub,
  });

  return new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
      ...serverContext,
    }),
    subscriptions: {
      onConnect: checkAPIKeySubscription,
    },
  });
};
