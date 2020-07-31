import { isJWT } from 'class-validator';
import { decode } from 'jsonwebtoken';
import { IsUserID, IsUserIDConstraint } from '../input/validators/IsUserID';

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

type AccessToken = {
  iss: string;
  sub: string;
  aud: string;
  iat: number;
  exp: number;
  azp: string;
  scope: string;
  gty: 'password';
};

export const getUserInfo = (id_token: string): IdToken => {
  return decode(id_token) as IdToken;
};

export const getUserID = (access_token: string): string => {
  if (!isJWT(access_token)) throw new Error('Not valid JWT access token');

  const { sub: userID } = decode(access_token) as AccessToken;

  if (!new IsUserIDConstraint().validate(userID)) throw new Error('Not Valid User ID');

  return userID;
};
