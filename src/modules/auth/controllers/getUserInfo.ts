import { decode } from 'jsonwebtoken';

type IdToken = {
  nickname: string;
  name: string;
  picture: string;
  updated_at: Date;
  email: string;
  email_verified: boolean;
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
};

export const getUserInfo = (id_token: string): IdToken => {
  return decode(id_token) as IdToken;
};
