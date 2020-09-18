import { Request } from 'express';
import { ExecutionParams } from 'subscriptions-transport-ws';

export type Context = { req: Request; connection: ExecutionParams };

export type connectionHeaders = { Authorization?: string; 'X-API-Key'?: string };
