import express from 'express';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { config } from 'dotenv';
import { buildSchema } from 'type-graphql';
import http from 'http';
import Redis from 'ioredis';

import { connect } from './connect';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { customAuthChecker } from './modules/auth/middleware/authChecker';
import { PriceResolver } from './subscriptions/prices';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { pricePublish } from './services/pricePublush';
import { LoginResolver } from './modules/auth/login';
import { APIKeyResolver } from './modules/auth/APIKey';
import { MongoDBCnfig } from './config/DbConfig';
import { checkAPIKey } from './modules/auth/api/APIkeys';
import { connectionHeaders } from './modules/auth/middleware/Context';
config();

const app = express();

(async () => {
  const options: Redis.RedisOptions = {
    retryStrategy: (times) => Math.max(times * 100, 3000),
  };

  const pubSub = new RedisPubSub({
    publisher: new Redis(options),
    subscriber: new Redis(options),
  });

  app.set('pubSub', pubSub);

  await connect(
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
    MongoDBCnfig.NAME
  );

  const schema = await buildSchema({
    resolvers: [PriceResolver, LoginResolver, APIKeyResolver],
    authChecker: customAuthChecker,
    pubSub,
  });
  const server = new ApolloServer({
    schema,
    context: ({ req, connection }: ExpressContext) => ({ req, connection }),
    subscriptions: {
      onConnect: async (connectionParams: connectionHeaders) => {
        await checkAPIKey(connectionParams);
      },
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
