import { ApolloError } from 'apollo-server-express';
import { PortfolioModel } from '../../../models/Portfolio';
import { Portfolio } from '../../../schemas/Portfolio';

export const getUserPortfolios = async (userID: string): Promise<Portfolio[] | never> => {
  let portfolios: Portfolio[] | null = null;

  try {
    portfolios = await PortfolioModel.find({ userID });
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }

  return portfolios;
};
