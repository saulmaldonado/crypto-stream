import { ApolloError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';

import { ContextHeaders } from '../../auth/middleware/Context';
import { KeyModel } from '../../../models/Key';
import { decryptKey } from '../controllers/helpers/keyFunctions';

export const validateKey = async (key: string): Promise<void | never> => {
  const _id = key.split('.')[0];

  const APIKey = await KeyModel.findOne({ _id });

  if (!APIKey) throw new ApolloError('Invalid API Key', 'UNAUTHORIZED');

  const decryptedKey = decryptKey(APIKey.encryptedKey, APIKey.iv);

  if (key !== decryptedKey) throw new ApolloError('Invalid API signature', 'UNAUTHORIZED');
};

export const checkAPIKey: () => MiddlewareFn<ContextHeaders> = () => async ({ context }, next) => {
  const { key } = context;

  if (!key) {
    return next();
  }

  await validateKey(key);
  return next();
};
