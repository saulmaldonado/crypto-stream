import { AuthChecker } from 'type-graphql';
import jwksRsa from 'jwks-rsa';
import { decode, Secret, verify } from 'jsonwebtoken';
import { ApolloError } from 'apollo-server-express';

import { Context } from './Context';

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

export const customAuthChecker: AuthChecker<Context> = async ({ context: { req, token } }) => {
  if (!token) return false;
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
      secret(req, header, payload, (err, JWTsecret) => {
        if (err || !secret) {
          rej(new ApolloError(err ?? 'Unable to verify JWT', 'INTERNAL_SERVER_ERROR'));
        }
        const resultToken = verify(token, JWTsecret as Secret) as JWTPayload;
        res(resultToken);
      })
    );

    const { aud, iss, azp } = decodedToken;

    if (
      !(iss === `https://${process.env.AUTH0_DOMAIN}/`) ||
      !(aud![0] === process.env.AUTH0_AUDIENCE || aud === process.env.AUTH0_AUDIENCE) ||
      !(azp === process.env.AUTH0_CLIENT_ID || azp === process.env.AUTH0_API_ID)
    ) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};
