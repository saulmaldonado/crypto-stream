import { ApolloError } from 'apollo-server-express';
import { PortfolioModel } from '../../../models/Portfolio';
import { Portfolio } from '../../../schemas/Portfolio';

export const getTransactionById = async (transactionID: string, userID?: string) => {
  let user: Pick<Portfolio, 'id' | 'tradingHistory'> | null = null;
  try {
    user = await PortfolioModel.findOne(
      { userID: userID, tradingHistory: { $elemMatch: { _id: transactionID } } },
      { _id: 0, tradingHistory: { $elemMatch: { _id: transactionID } } }
    );
  } catch (error) {
    console.log(user);
    throw new ApolloError(error, 'DATABASE_ERROR');
  }

  if (!user) throw new ApolloError('User not found', 'AUTHENTICATION_ERROR');
  if (!user.tradingHistory?.[0]) throw new ApolloError('Transaction not found', 'BAD_USER_INPUT');

  return user.tradingHistory[0];
};
