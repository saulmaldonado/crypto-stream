/* eslint-disable camelcase */
import { ApolloError } from 'apollo-server-express';
import axios, { AxiosError } from 'axios';
import qs from 'qs';

import { Auth0Endpoints } from '../../../config/Auth0Config';
import { LoginTokensAndID } from '../../../schemas/Tokens';
import { LoginInput } from '../input/loginInput';
import { getUserInfo } from './getUserInfo';

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
}: LoginInput): Promise<LoginTokensAndID | never> => {
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
    const { data: tokens } = await axios
      .post<Omit<LoginTokensAndID, 'userID'>>(Auth0Endpoints.login, qs.stringify(form), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
      .catch((error: AxiosError) => {
        throw new ApolloError(error.message, 'INTERNAL_SERVER_ERROR', {
          code: error.code,
          hostname: error.config.url,
        });
      });

    const { sub: userID } = getUserInfo(tokens.id_token);

    return { ...tokens, userID };
  } catch (error) {
    if (error?.response?.status === 403) {
      const {
        response: {
          data: { error_description, error_type },
        },
      } = error;
      throw new ApolloError(error_description, error_type);
    }
    throw error;
  }
};
