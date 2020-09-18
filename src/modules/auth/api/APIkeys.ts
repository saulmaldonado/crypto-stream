import { ApolloError } from 'apollo-server-express';
import { randomBytes } from 'crypto';
import { KeyModel } from '../../../models/Key';
import { ConnectionContext } from 'subscriptions-transport-ws';

export const generateAPIKey = () => {
  return randomBytes(16).toString('hex');
};

export const checkAPIKeySubscription = async (
  connection: any,
  _: any,
  context: ConnectionContext
) => {
  const APIKey = connection['X-API-Key'];
  const token = connection.Authorization?.split(' ')[1] || '';
  const address = context.request.socket.localAddress;

  if (!APIKey || Array.isArray(APIKey)) {
    return { address, token };
  } else {
    const result = await KeyModel.findOne({ key: APIKey }).catch((err) => {
      throw new ApolloError(err, 'DATABASE_ERROR');
    });

    if (!result) throw new ApolloError('Invalid API key', 'UNAUTHORIZED');

    return { APIKey, address, token };
  }
};
