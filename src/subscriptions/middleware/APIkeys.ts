import { ApolloError } from 'apollo-server-express';
import WebSocket from 'ws';
import { pbkdf2Sync } from 'crypto';
import { v4 } from 'uuid';

import { ConnectionContext } from 'subscriptions-transport-ws';
import { KeyModel } from '../../models/Key';
import { ConnectionHeaders, Context } from '../../modules/auth/middleware/Context';
import { getTokenUserID } from '../../modules/auth/jwt/getTokenUserID';

export type Key = {
  _id: string;
  key: string;
  hashedKey: string;
  timestamp: Date;
};

export const generateAPIKey = (token: Context) => {
  const userID = getTokenUserID(token);
  const timestamp = new Date();
  try {
    const { key, _id } = genKey(userID, timestamp);
    const hashedKey = hashKey(key);

    return { _id, key, hashedKey, timestamp };
  } catch (error) {
    throw new ApolloError(error, 'INTERNAL_SERVER_ERROR');
  }
};

export const genKey = (userID: string, timestamp: Date, _id?: string) => {
  const time = timestamp.getTime();
  const keyString = `${userID}.${time}`;

  const keySig = pbkdf2Sync(keyString, process.env.API_KEY_SECRET!, 10000, 16, 'sha512').toString(
    'hex'
  );

  if (!_id) {
    _id = v4();
  }

  return { key: `${_id}.${keySig}`, timestamp, _id };
};

export const hashKey = (key: string) => {
  return pbkdf2Sync(key, process.env.API_KEY_SECRET!, 10000, 64, 'sha512').toString('hex');
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
