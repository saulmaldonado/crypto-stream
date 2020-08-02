import { AuthChecker } from 'type-graphql';
import jwksRsa from 'jwks-rsa';
import { decode, Secret, verify } from 'jsonwebtoken';
import { ApolloError } from 'apollo-server-express';

import { Context } from './Context';

export const customAuthChecker: AuthChecker<Context> = async ({ context }) => {
  const { req } = context;
  if (!req.headers.authorization) return false;
  const token = req.headers.authorization.split(' ')[1];
  const secret = jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  });

  const decoded = decode(token, { complete: true });
  if (!decoded) return false;

  const { header, payload } = decoded as {
    header: Record<string, string>;
    payload: Record<string, string>;
    signature: string;
  };

  try {
    const decodedToken = await new Promise<JWTPayload | never>((res, rej) =>
      secret(req, header, payload, (err, secret) => {
        if (err || !secret)
          rej(new ApolloError(err ?? 'Unable to verify JWT', 'INTERNAL_SERVER_ERROR'));
        const decodedToken = verify(token, secret as Secret) as JWTPayload;
        res(decodedToken);
      })
    );

    const { aud, iss, azp } = decodedToken;

    if (
      !(iss === `https://${process.env.AUTH0_DOMAIN}/`) ||
      !(aud![0] === process.env.AUTH0_AUDIENCE) ||
      !(azp === process.env.AUTH0_CLIENT_ID)
    ) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

export type JWTPayload = {
  iss?: string;
  /**
   * userID
   */
  sub?: string;
  aud?: string[];
  iat?: number;
  exp?: number;
  azp?: string;
  scope?: string;
  gty?: string;
  permissions?: string[];
};
