import { User } from '../../../schemas/Users';
import { RegisterInput } from '../input/registerInput';
import axios from 'axios';
import { Auth0Endpoints } from '../../../config/Auth0Config';

type SignupRequestBody = {
  client_id: string;
  email: string;
  password: string;
  connection: string;
  username?: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  user_metadata: Record<string, string>;
};

export const registerUser = async ({ email, password, username }: RegisterInput): Promise<User> => {
  const { data: user } = await axios.post(
    Auth0Endpoints.signup,
    {
      client_id: process.env.AUTH0_CLIENT_ID,
      email,
      password,
      username,
      connection: process.env.AUTH0_CONNECTION,
    },
    { headers: { 'content-type': 'application/json' } }
  );
  return user;
};
