import { ApolloError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';

import { ContextHeaders } from '../../auth/middleware/Context';
import { KeyModel } from '../../../models/Key';
import { hashKey } from '../controllers/helpers/keyFunctions';

export const checkAPIKey: () => MiddlewareFn<ContextHeaders> = () => async ({ context }, next) => {
  const { key } = context;

  if (!key) {
    return next();
  }

  validateKey(key);
  return next();
};

export const validateKey = async (key: string): Promise<void | never> => {
  const keyID = key.split('.')[0];

  const APIKey = await KeyModel.findOne({ _id: keyID });

  if (!APIKey) throw new ApolloError('Invalid API Key', 'UNAUTHORIZED');

  const hashedDownstreamKey = hashKey(key);
  const hashedUpstreamKey = APIKey.hashedKey;

  if (hashedDownstreamKey !== hashedUpstreamKey)
    throw new ApolloError('Invalid API signature', 'UNAUTHORIZED');
};
