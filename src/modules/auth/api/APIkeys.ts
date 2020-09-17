import { ApolloError } from 'apollo-server-express';
import { randomBytes } from 'crypto';
import { KeyModel } from '../../../models/Key';
import { connectionHeaders } from '../middleware/Context';
import { ConnectionContext } from 'subscriptions-transport-ws';

export const generateAPIKey = () => {
  return randomBytes(16).toString('hex');
};

export const checkAPIKey = async (
  connection: connectionHeaders,
  _: any,
  context: ConnectionContext
) => {
  const APIKey = connection['X-API-Key'];
  if (!APIKey || Array.isArray(APIKey)) {
    const address = context.request.connection.remoteAddress!;
    return { ip: address };
  } else {
    const result = await KeyModel.findOne({ key: APIKey }).catch((err) => {
      throw new ApolloError(err, 'DATABASE_ERROR');
    });

    if (!result) throw new ApolloError('Invalid API key', 'UNAUTHORIZED');

    return { APIKey };
  }
};
