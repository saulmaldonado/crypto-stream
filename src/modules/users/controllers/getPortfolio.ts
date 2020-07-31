import { ApolloError } from 'apollo-server-express';
import { UsersModel } from '../../../models/Users';
import { User } from '../../../schemas/User';

export const getUserPortfolio = async (userID: string): Promise<User | never> => {
  const user = await UsersModel.findOne({ userID });

  if (!user) throw new ApolloError('User portfolio not found', 'AuthenticationError');

  return user;
};
