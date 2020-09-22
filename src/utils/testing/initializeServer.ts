import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { customAuthChecker } from '../../modules/auth/middleware/authChecker';

export const initializeTestingServer = async (
  resolvers: [Function, ...Function[]],
  serverContext: Record<string, string>
): Promise<ApolloServer> => {
  const schema = await buildSchema({
    resolvers: resolvers,
    authChecker: customAuthChecker,
  });

  return new ApolloServer({
    schema,
    context: ({ req, res }) => ({
      req,
      res,
      ...serverContext,
    }),
  });
};
