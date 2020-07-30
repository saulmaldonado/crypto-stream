import { config } from 'dotenv';
config();

export const Auth0Endpoints = {
  signup: `https://${process.env.AUTH0_DOMAIN}/dbconnections/signup`,
};
