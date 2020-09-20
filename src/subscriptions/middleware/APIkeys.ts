import { ApolloError } from 'apollo-server-express';
import WebSocket from 'ws';
import { pbkdf2Sync } from 'crypto';
import { v4 } from 'uuid';

import { ConnectionContext } from 'subscriptions-transport-ws';
import { KeyModel } from '../../models/Key';
import { ConnectionHeaders, Context } from '../../modules/auth/middleware/Context';
import { getTokenUserID } from '../../modules/auth/jwt/getTokenUserID';

export const generateAPIKey = (token: Context) => {
  const userID = getTokenUserID(token);
  const secret = process.env.API_KEY_SECRET!;
  const time = Date.now();
  const keyString = `${userID}.${time}`;
  try {
    const keySig = pbkdf2Sync(keyString, secret, 10000, 16, 'sha512').toString('hex');
    const keyID = v4();
    const key = `${keyID}.${keySig}`;

    return { id: keyID, key };
  } catch (error) {
    throw new ApolloError(error, 'INTERNAL_SERVER_ERROR');
  }
};

export const checkAPIKeySubscription = async (
  connection: ConnectionHeaders,
  websocket: WebSocket,
  context: ConnectionContext
) => {
  const APIKey = connection['X-API-Key'];
  const token = connection.Authorization?.split(' ')[1] || '';
  const address = context.request.socket.localAddress;

  if (!APIKey || Array.isArray(APIKey)) {
    return { address, token };
  }
  const result = await KeyModel.findOne({ key: APIKey }).catch((err) => {
    throw new ApolloError(err, 'DATABASE_ERROR');
  });

  if (!result) throw new ApolloError('Invalid API key', 'UNAUTHORIZED');

  return { APIKey, address, token };
};
