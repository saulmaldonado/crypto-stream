import { ApolloError } from 'apollo-server-express';
import axios, { AxiosError, AxiosResponse } from 'axios';
import qs from 'qs';

import { Auth0Endpoints } from '../../../config/Auth0Config';
import { LoginTokens } from '../../../schemas/Tokens';
import { User } from '../../../schemas/Users';
import { LoginInput } from '../input/loginInput';

var options = {
  method: 'POST',
  url: 'https://YOUR_DOMAIN/oauth/token',
  headers: { 'content-type': 'application/x-www-form-urlencoded' },
  form: {
    grant_type: 'password',
    username: 'user@example.com',
    password: 'pwd',
    audience: 'YOUR_API_IDENTIFIER',
    scope: 'read:sample',
    client_id: 'YOUR_CLIENT_ID',
    client_secret: 'YOUR_CLIENT_SECRET',
  },
};

type LoginRequestBody = {
  grant_type: 'password';
  client_id: string;
  client_secret?: string;
  audience?: string;
  username: string;
  password: string;
  scope?: string;
  realm?: string;
};
export const loginUser = async ({
  usernameOrEmail,
  password,
}: LoginInput): Promise<LoginTokens | never> => {
  if (!process.env.AUTH0_CLIENT_ID) {
    throw new ApolloError('Auth0 client ID not provided', 'INTERNAL_SERVER_ERROR');
  }

  const form: LoginRequestBody = {
    grant_type: 'password',
    username: usernameOrEmail,
    password,
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'offline_access openid',
    client_id: process.env.AUTH0_CLIENT_ID,
  };

  try {
    const { data: tokens } = await axios.post<LoginTokens>(
      Auth0Endpoints.login,
      qs.stringify(form),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );
    return tokens;
  } catch (error) {
    let {
      response: {
        data: { error_description, error_type },
      },
    } = error;

    // Wrong email/username is already handled by LoginInput class-validators
    if (error_description === 'Wrong email or password.') error_description = 'Wrong password';

    throw new ApolloError(error_description, error_type);
  }
};
