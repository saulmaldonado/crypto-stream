import { ApolloError } from 'apollo-server-express';
import { UsersModel } from '../../../models/Users';
import { User } from '../../../schemas/User';

export const addNewPortfolio = async (userID: string, username: string): Promise<User | never> => {
  try {
    const user = await UsersModel.create({ userID, username });
    return user;
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
