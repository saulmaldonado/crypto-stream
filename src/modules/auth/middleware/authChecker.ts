import { AuthChecker } from 'type-graphql';

import { Context } from './Context';
import jwksRsa from 'jwks-rsa';
import { decode, Secret, verify } from 'jsonwebtoken';
import { ApolloError } from 'apollo-server-express';

export const customAuthChecker: AuthChecker<Context> = async ({ context }) => {
  const { req } = context;
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(' ')[1];
    const secret = jwksRsa.expressJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
    });

    const decoded = decode(token, { complete: true });
    if (!decoded) throw new ApolloError('Unable to verify JWT', 'INTERNAL_SERVER_ERROR');

    const { header, payload } = decoded as {
      header: Record<string, string>;
      payload: Record<string, string>;
      signature: string;
    };

    try {
      const decodedToken = await new Promise<string | object | never>((res, rej) =>
        secret(req, header, payload, (err, secret) => {
          if (err || !secret)
            rej(new ApolloError(err ?? 'Unable to verify JWT', 'INTERNAL_SERVER_ERROR'));
          const decodedToken = verify(token, secret as Secret);
          res(decodedToken);
        })
      );

      console.log(decodedToken);

      return true;
    } catch (error) {
      return false;
    }
  } else {
    return false; // or false if access is denied
  }
};
