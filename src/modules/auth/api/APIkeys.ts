import { ApolloError } from 'apollo-server-express';
import { randomBytes } from 'crypto';
import { KeyModel } from '../../../models/Key';
import { connectionHeaders } from '../middleware/Context';

export const generateAPIKey = () => {
  return randomBytes(16).toString('hex');
};

export const checkAPIKey = async (connection: connectionHeaders) => {
  const APIKey = connection['X-API-Key'];

  if (!APIKey || Array.isArray(APIKey))
    throw new ApolloError('API Key not provided', 'UNAUTHORIZED');

  const result = await KeyModel.findOne({ key: APIKey }).catch((err) => {
    throw new ApolloError(err, 'DATABASE_ERROR');
  });

  if (!result) throw new ApolloError('Invalid API key', 'UNAUTHORIZED');

  return true;
};
