import { PubSubOptions } from 'apollo-server-express';
import { graphql, GraphQLSchema } from 'graphql';
import { buildSchema, PubSubEngine } from 'type-graphql';
import { APIKeyResolver } from '../../modules/apiKey/APIKey';
import { customAuthChecker } from '../../modules/auth/middleware/authChecker';
import { getTestingToken } from './getTestingToken';

const GET_API_KEY = `
query {
  getAPIKey {
    timestamp
    key
  }
}`;

type SchemaAndToken = { schema: GraphQLSchema; token: string };
type CreateSchemaAndToken = (
  resolvers: [Function, ...Function[]],
  pubSub?: PubSubEngine | PubSubOptions
) => Promise<SchemaAndToken>;

/**
 * Generates GraphQL schema and requests testing token.
 * @param {[Function, ...Function[]]} resolvers
 * @param {PubSubEngine|PubSubOptions} [pubSub]
 */
export const createSchemaAndToken: CreateSchemaAndToken = async (resolvers, pubSub) => {
  const schema: GraphQLSchema = await buildSchema({
    resolvers,
    authChecker: customAuthChecker,
    pubSub,
  });
  const token = await getTestingToken();

  return { schema, token };
};

/**
 * Generates a new API key authenticated testing
 */
export const getTestingApiKey = async (): Promise<string> => {
  const { schema, token } = await createSchemaAndToken([APIKeyResolver]);

  const result = await graphql(schema, GET_API_KEY, null, {
    token,
  });

  return result.data?.getAPIKey.key;
};
