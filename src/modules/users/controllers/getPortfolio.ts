import { ApolloError } from 'apollo-server-express';
import { UsersModel } from '../../../models/Users';
import { User } from '../../../schemas/User';

export const getUserPortfolio = async (userID: string): Promise<User | never> => {
  let user: User | null = null;

  try {
    user = await UsersModel.findOne({ userID });
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }

  if (!user) throw new ApolloError('User portfolio not found', 'AuthenticationError');
  return user;
};
