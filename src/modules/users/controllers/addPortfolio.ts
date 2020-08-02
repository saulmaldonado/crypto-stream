import { ApolloError } from 'apollo-server-express';

import { PortfolioModel } from '../../../models/Portfolio';
import { Portfolio } from '../../../schemas/Portfolio';

export const addNewPortfolio = async (
  userID: string,
  username: string
): Promise<Portfolio | never> => {
  try {
    const user = await PortfolioModel.create({ userID, username });
    return user;
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
