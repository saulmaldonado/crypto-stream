import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Request } from 'express';
import { ExecutionParams } from 'subscriptions-transport-ws';

export type Context = {
  token?: string;
  address: string;
  key?: string;
  req: Request;
};

export const createContext = ({ req, connection }: ExpressContext): ExecutionParams | Context => {
  if (connection) {
    return connection.context;
  }
  const token = req.headers.authorization?.split(' ')[1];
  const key = req.header('x-api-key');
  const address = req.ip;

  return { token, key, address, req };
};
