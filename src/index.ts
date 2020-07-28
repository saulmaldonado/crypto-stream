import express from 'express';
import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import { config } from 'dotenv';
import { buildSchema, Query } from 'type-graphql';
import { Resolver } from 'type-graphql';

config();

const app = express();

@Resolver()
class HelloResolver {
  @Query(() => String)
  async hello() {
    return 'Hello';
  }
}

(async () => {
  const schema = await buildSchema({
    resolvers: [HelloResolver],
  });

  const server = new ApolloServer({
    schema,
  });
  server.applyMiddleware({ app });

  const port = process.env.PORT ?? 5000;

  app.listen({ port }, () => {
    console.log(`Listing on port ${port}... 📡`);
  });
})();
