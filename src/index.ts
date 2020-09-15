import express from 'express';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { config } from 'dotenv';
import { buildSchema } from 'type-graphql';
import http from 'http';
import Redis from 'ioredis';

import { connect } from './connect';
import { RegisterResolver } from './modules/auth/register';
import { LoginResolver } from './modules/auth/login';
import { EmailResolver } from './modules/auth/verifyEmail';
import { PortfolioResolver } from './modules/users/portfolios';
import { TransactionResolver } from './modules/users/transaction';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { customAuthChecker } from './modules/auth/middleware/authChecker';
import { PriceResolver } from './subscriptions/prices';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { pricePublish } from './services/pricePublush';
config();

const app = express();

(async () => {
  const REDIS_HOST = '127.0.0.1';
  const REDIS_PORT = 6379;

  const options: Redis.RedisOptions = {
    host: REDIS_HOST,
    port: REDIS_PORT,
    retryStrategy: (times) => Math.max(times * 100, 3000),
  };

  const pubSub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options),
  });

  app.set('pubSub', pubSub);

  const uri = process.env.CONNECTION_STRING;

  await connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  const schema = await buildSchema({
    resolvers: [
      RegisterResolver,
      LoginResolver,
      EmailResolver,
      PortfolioResolver,
      TransactionResolver,
      PriceResolver,
    ],
    authChecker: customAuthChecker,
    pubSub,
  });
  const server = new ApolloServer({
    schema,
    context: ({ req }: ExpressContext) => ({ req }),
    subscriptions: {
      onConnect: (params, webSocket, context) => console.log(params),
    },
  });

  server.applyMiddleware({ app });

  const port = process.env.PORT ?? 5000;

  const httpServer = http.createServer(app);

  server.installSubscriptionHandlers(httpServer);

  httpServer.listen({ port }, () => {
    console.log(`Listening on port ${port}... 📡`);
    console.log(`🚀 Subscriptions ready at ws://localhost:${port}${server.subscriptionsPath}`);
  });

  pricePublish(app, 15);
})();
