import { graphql, GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
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

const createSchemaAndToken = async (): Promise<SchemaAndToken> => {
  const schema: GraphQLSchema = await buildSchema({
    resolvers: [APIKeyResolver],
    authChecker: customAuthChecker,
  });
  const token = await getTestingToken();

  return { schema, token };
};

export const getTestingApiKey = async (): Promise<string> => {
  const { schema, token } = await createSchemaAndToken();

  const result = await graphql(schema, GET_API_KEY, null, {
    token,
  });

  return result.data?.getAPIKey.key;
};
