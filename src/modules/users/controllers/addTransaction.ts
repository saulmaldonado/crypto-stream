import { ApolloError } from 'apollo-server-express';

import { TransactionModel } from '../../../models/Transaction';
import { PortfolioModel } from '../../../models/Portfolio';
import { Transaction } from '../../../schemas/Transaction';
import { AddTransactionInput } from '../input/AddTransactionInput';

export const addNewTransaction = async ({
  portfolioID,
  coinName,
  quantity,
  buyOrSell,
  coinID,
  coinSymbol,
}: AddTransactionInput): Promise<Transaction | never> => {
  try {
    const transaction = new TransactionModel({
      coinName,
      quantity,
      buyOrSell,
      coinID,
      coinSymbol,
      date: new Date(),
    });

    const portfolio = await PortfolioModel.findOneAndUpdate(
      { _id: portfolioID },
      { $push: { tradingHistory: transaction } },
      { new: true }
    );

    if (!portfolio || !portfolio.tradingHistory) {
      throw new ApolloError('User does not exist', 'UNAUTHORIZED');
    }

    return portfolio.tradingHistory[portfolio.tradingHistory.length - 1];
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
