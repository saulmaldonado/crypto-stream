import { ApolloError } from 'apollo-server-express';
import { PortfolioModel } from '../../../models/Portfolio';

export const getPortfolioById = async (portfolioID: string) => {
  try {
    return await PortfolioModel.findById(portfolioID);
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
