import { ApolloError } from 'apollo-server-express';
import { ObjectId } from 'mongodb';
import { UsersModel } from '../../../models/Users';
import { Transaction } from '../../../schemas/Transaction';
import { User } from '../../../schemas/User';

export const getTransactionById = async (transactionID: string, userID?: string) => {
  let user: Pick<User, 'id' | 'tradingHistory'> | null = null;
  try {
    if (!userID) {
      /**
       * TODO protected endpoint
       */
      user = await UsersModel.findOne({ tradingHistory: { $elemMatch: { _id: transactionID } } });
    } else {
      user = await UsersModel.findOne(
        { userID: userID },
        { tradingHistory: { $elemMatch: { _id: transactionID } } }
      );
    }
  } catch (error) {
    console.log(user);
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
  if (!user) throw new ApolloError('User not found', 'AUTHENTICATION_ERROR');
  if (!user.tradingHistory?.[0]) throw new ApolloError('Transaction not found', 'BAD_USER_INPUT');

  return user.tradingHistory[0];
};
