import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Request } from 'express';
import { ExecutionParams } from 'subscriptions-transport-ws';

export type Context = { req: Request; connection: ExecutionParams };

export type ConnectionHeaders = { Authorization?: string; 'X-API-Key'?: string };

export type ContextHeaders = { token: string; key: string; address: string };

export const createContext = ({ req, connection }: ExpressContext) => {
  if (connection) {
    return connection.context;
  }
  const token = req.headers.authorization?.split(' ')[1] || '';
  const key = req.header('x-api-key');
  const address = req.ip;

  return { token, key, address, req };
};
