import axios from 'axios';
import { Auth0Endpoints } from '../../../config/Auth0Config';
import { config } from 'dotenv';
config();

type AccessTokenRequestBody = {
  client_id: string;
  client_secret: string;
  audience: string;
  grant_type: string;
};

const body: AccessTokenRequestBody = {
  client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID!,
  client_secret: process.env.AUTH0_MANAGEMENT_SECRET!,
  audience: process.env.AUTH0_MANAGEMENT_AUDIENCE!,
  grant_type: 'client_credentials',
};

export const managementToken = axios.post<{ access_token: string; token_type: string }>(
  Auth0Endpoints.managementToken,
  JSON.stringify(body),
  { headers: { 'content-type': 'application/json' } }
);
