import { Request } from 'express';
import { ExecutionParams } from 'subscriptions-transport-ws';

export type Context = { req: Request; connection: ExecutionParams };

export type connectionHeaders = { Authorization?: string; 'X-API-Key'?: string };

export type ContextHeaders = { token: string; key: string; address: string };
