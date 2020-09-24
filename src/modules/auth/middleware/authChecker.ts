import { AuthChecker } from 'type-graphql';
import jwksRsa from 'jwks-rsa';
import { decode, Secret, verify } from 'jsonwebtoken';
import { ApolloError } from 'apollo-server-express';

import { Context } from './Context';

export type JWTPayload = {
  iss?: string;
  sub?: string; //userID
  aud?: string[];
  iat?: number;
  exp?: number;
  azp?: string;
  scope?: string;
  gty?: string;
  permissions?: string[];
};

type JWTToken = {
  header: Record<string, string>;
  payload: Record<string, string>;
  signature: string;
};

export const customAuthChecker: AuthChecker<Context> = async ({ context: { token, req } }) => {
  if (!token) return false;
  const secret = jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
  });

  const decoded = decode(token, { complete: true });

  const { header } = decoded as JWTToken;

  try {
    const decodedToken = await new Promise<JWTPayload>((res, rej) =>
      /**
       * patch jwksRsa.expressJwtSecret return method to exclude req and payload.
       * req and payload go unused in the original method and can safely be unused in this
       * scenario
       * https://github.com/auth0/node-jwks-rsa/blob/master/src/integrations/express.js#L24
       */
      secret(header, (err, JWTsecret) => {
        if (err || !JWTsecret) {
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
