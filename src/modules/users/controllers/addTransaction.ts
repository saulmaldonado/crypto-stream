import { ApolloError } from 'apollo-server-express';

import { TransactionModel } from '../../../models/Transaction';
import { UsersModel } from '../../../models/Users';
import { Transaction } from '../../../schemas/Transaction';
import { AddTransactionInput } from '../input/AddTransactionInput';

export const addNewTransaction = async ({
  userID,
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

    const user = await UsersModel.findOneAndUpdate(
      { userID },
      { $push: { tradingHistory: transaction } },
      { new: true }
    );

    if (!user || !user.tradingHistory) {
      throw new ApolloError('User does not exist', 'UNAUTHORIZED');
    }

    return user.tradingHistory[user.tradingHistory.length - 1];
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
