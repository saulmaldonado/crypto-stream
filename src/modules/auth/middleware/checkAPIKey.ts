import { ApolloError } from 'apollo-server-express';
import { MiddlewareFn } from 'type-graphql';

import { ContextHeaders } from './Context';
import { KeyModel } from '../../../models/Key';

export const checkAPIKey: () => MiddlewareFn<ContextHeaders> = () => async ({ context }, next) => {
  const { key } = context;

  if (!key) {
    return next();
  }
  const result = await KeyModel.findOne({ key }).catch((err) => {
    throw new ApolloError(err, 'DATABASE_ERROR');
  });

  if (!result) throw new ApolloError('Invalid API Key', 'UNAUTHORIZED');

  return next();
};
