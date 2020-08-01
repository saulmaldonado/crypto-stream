import express from 'express';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { config } from 'dotenv';
import { buildSchema } from 'type-graphql';

import { connect } from './connect';
import { RegisterResolver } from './modules/auth/register';
import { LoginResolver } from './modules/auth/login';
import { EmailResolver } from './modules/auth/verifyEmail';
import { UserResolver } from './modules/users/users';
import { TransactionResolver } from './modules/users/transaction';
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
    resolvers: [RegisterResolver, LoginResolver, EmailResolver, UserResolver, TransactionResolver],
  });

  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req }),
  });

  server.applyMiddleware({ app });

  const port = process.env.PORT ?? 5000;

  app.listen({ port }, () => {
    console.log(`Listening on port ${port}... 📡`);
  });
})();
