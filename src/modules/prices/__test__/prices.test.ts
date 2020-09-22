import { Server } from 'http';
import Redis from 'ioredis';
import express from 'express';
import { buildSchema } from 'type-graphql';
import { PriceResolver } from '../prices';
import { ApolloServer } from 'apollo-server-express';
import { getTestingToken } from '../../../utils/testing/getTestingToken';
import { checkAPIKeySubscription } from '../../../subscriptions/middleware/APIkeys';
import { createServer } from 'http';
import { pubSub } from '../../../utils/redisPubSub';
import { redis } from '../../../utils/redisCache';

let httpServer: Server;
let redisCache: Redis.Redis;
let token: string;

beforeAll(async () => {
  redisCache = redis;

  token = await getTestingToken();
  const app = express();

  const schema = await buildSchema({
    resolvers: [PriceResolver],
    pubSub,
  });

  const server = new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
      token,
    }),
    subscriptions: {
      onConnect: checkAPIKeySubscription,
    },
  });

  server.applyMiddleware({ app });

  httpServer = createServer(app);

  server.installSubscriptionHandlers(httpServer);

  httpServer.listen(() => {
    console.log(`Listening... 📡`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${server.subscriptionsPath}`);
  });
});

afterAll(async () => {
  httpServer.close();
  redisCache.disconnect();
  await pubSub.close();
});

describe('prices: getPrices', () => {
  it('test', () => {
    expect(true).toBeTruthy();
  });
});
