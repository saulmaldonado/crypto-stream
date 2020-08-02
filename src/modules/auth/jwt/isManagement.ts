import { ApolloError } from 'apollo-server-express';
import { decode } from 'jsonwebtoken';
import { JWTPayload } from '../middleware/authChecker';
import { Context } from '../middleware/Context';

export const isManagement = ({ req }: Context): void | never => {
  const token = req.headers.authorization!.split(' ')[1];
  const decodedToken = decode(token);

  const { permissions } = decodedToken as JWTPayload;
  if (!permissions!.includes('admin') || !permissions!.includes('management')) {
    throw new ApolloError('You are unauthorized to access portfolios by userID', 'UNAUTHORIZED');
  }
};
