import { ApolloError } from 'apollo-server-express';
import { PortfolioModel } from '../../../models/Users';
import { Portfolio } from '../../../schemas/Portfolio';

export const getUsersPortfolio = async (userID: string): Promise<Portfolio | never> => {
  let user: Portfolio | null = null;

  try {
    user = await PortfolioModel.findOne({ _id: userID });
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }

  if (!user) throw new ApolloError('User portfolio not found', 'AuthenticationError');
  return user;
};
