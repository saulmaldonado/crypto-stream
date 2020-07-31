import { ApolloError, ApolloServer } from 'apollo-server-express';
import axios from 'axios';
import { Auth0Endpoints } from '../../config/Auth0Config';
import { getManagementToken } from './jwt/managementApi';

type EmailVerificationResponseBody = {
  status: string;
  type: string;
  created_at: string;
  id: string;
};

const verifyEmail = async (user_id: string): Promise<void | never> => {
  const access_token = await getManagementToken();

  const body: { user_id: string; client_id: string } = {
    user_id,
    client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID!,
  };

  try {
    const {
      data: { status },
    } = await axios.post<EmailVerificationResponseBody>(
      Auth0Endpoints.emailVerification,
      JSON.stringify(body),
      {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${access_token}` },
      }
    );
  } catch (error) {
    throw new ApolloError(error.message, 'INTERNAL_SERVER_ERROR');
  }
};
