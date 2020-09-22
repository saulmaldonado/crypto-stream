/* eslint-disable no-console */
import express from 'express';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { config } from 'dotenv';
import { buildSchema } from 'type-graphql';
import http from 'http';

import { connect } from './connect';
import { customAuthChecker } from './modules/auth/middleware/authChecker';
import { PriceResolver } from './modules/prices/prices';
import { LoginResolver } from './modules/auth/login';
import { APIKeyResolver } from './modules/apiKey/APIKey';
import { MongoDBConfig } from './config/DbConfig';
import { checkAPIKeySubscription } from './subscriptions/middleware/APIkeys';
import { RegisterResolver } from './modules/auth/register';
import { createContext } from './modules/auth/middleware/Context';
import { pubSub } from './utils/redisPubSub';
import { startPricePublisher } from './modules/prices/publsihers/pricePublush';

config();

const app = express();

(async () => {
  await connect(
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    },
    MongoDBConfig.API_DB_NAME
  );

  const schema = await buildSchema({
    resolvers: [PriceResolver, LoginResolver, APIKeyResolver, RegisterResolver],
    authChecker: customAuthChecker,
    pubSub,
  });
  const server = new ApolloServer({
    schema,
    context: createContext,
    subscriptions: {
      onConnect: checkAPIKeySubscription,
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

  // startPricePublisher(pubSub, 15);
})();
