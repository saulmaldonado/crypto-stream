import { ApolloError } from 'apollo-server-express';
import WebSocket from 'ws';

import { ConnectionContext } from 'subscriptions-transport-ws';
import { KeyModel } from '../../models/Key';
import { decryptKey } from '../../modules/apiKey/controllers/helpers/keyFunctions';

type ConnectionParams = {
  'X-API-Key'?: string;
  Authorization?: string;
};

export const checkAPIKeySubscription = async (
  connectionParams: ConnectionParams,
  websocket: WebSocket,
  context: ConnectionContext
) => {
  const key = connectionParams['X-API-Key'];
  const token = connectionParams.Authorization?.split(' ')[1];
  const address = context.request.socket.localAddress;

  console.log(key);

  if (!key || Array.isArray(key)) {
    return { address, token };
  }
  const _id: string = key.split('.')[0];

  const result = await KeyModel.findOne({ _id });

  try {
    if (!result) throw new Error();

    const decryptedKey = decryptKey(result.encryptedKey, result.iv);

    if (decryptedKey !== key) throw new Error();

    return { key, address, token };
  } catch (error) {
    throw new ApolloError('API key is invalid.', 'UNAUTHORIZED');
  }
};
