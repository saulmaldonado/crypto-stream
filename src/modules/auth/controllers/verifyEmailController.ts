/* eslint-disable camelcase */
import { ApolloError } from 'apollo-server-express';
import axios from 'axios';

import { Auth0Endpoints } from '../../../config/Auth0Config';
import { getManagementToken } from '../jwt/managementApi';

type EmailVerificationResponseBody = {
  status: string;
  type: string;
  created_at: string;
  id: string;
};

export const verifyEmail = async (user_id: string): Promise<void | never> => {
  const access_token = await getManagementToken();

  const body: { user_id: string; client_id?: string } = {
    user_id,
    client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
  };
  try {
    await axios.post<EmailVerificationResponseBody>(Auth0Endpoints.emailVerification, body, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
    });
  } catch (error) {
    throw new ApolloError(error.response.data.message, 'INTERNAL_SERVER_ERROR');
  }
};
