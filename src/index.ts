import express from 'express';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { config } from 'dotenv';
import { buildSchema, Query, Resolver } from 'type-graphql';
import { connect } from './connect';

import { RegisterResolver } from './modules/user/register';
config();

const app = express();

(async () => {
  const uri = process.env.CONNECTION_STRING;

  await connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });

  const schema = await buildSchema({
    resolvers: [RegisterResolver],
  });

  const server = new ApolloServer({
    schema,
  });

  server.applyMiddleware({ app });

  const port = process.env.PORT ?? 5000;

  app.listen({ port }, () => {
    console.log(`Listening on port ${port}... 📡`);
  });
})();
