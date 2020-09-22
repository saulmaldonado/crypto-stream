import { config } from 'dotenv';
import axios from 'axios';

config();

export const getTestingToken = async () => {
  const url = `https://${process.env.AUTH0_DOMAIN}/oauth/token`;
  const body = `{"client_id":"${process.env.AUTH0_API_ID}","client_secret":"${process.env.AUTH0_API_SECRET}","audience":"${process.env.AUTH0_AUDIENCE}","grant_type":"client_credentials"}`;
  const options = {
    headers: { 'content-type': 'application/json' },
  };

  const {
    data: { access_token },
  } = await axios.post<{ access_token: string; expires_in: number; token_type: string }>(
    url,
    body,
    options
  );

  return access_token;
};

export const getInvalidTestingToken = () => {
  // example token from https://jwt.io
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
};
