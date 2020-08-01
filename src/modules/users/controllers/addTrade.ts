import { DocumentType } from '@typegoose/typegoose';
import { ApolloError } from 'apollo-server-express';

import { UsersModel } from '../../../models/Users';
import { User } from '../../../schemas/User';
import { AddTransactionInput } from '../input/AddTransactionInput';
import { buy } from './trading/buy';
import { sell } from './trading/sell';

export type UserPortfolio = DocumentType<Pick<User, 'portfolio' | 'id'>>;
export type trade = (
  user: UserPortfolio,
  coin: Omit<AddTransactionInput, 'buyOrSell'>
) => Promise<void>;

export const addNewTrade = async ({
  coinID,
  coinName,
  coinSymbol,
  quantity,
  buyOrSell,
  userID,
}: AddTransactionInput) => {
  const user = await UsersModel.findOne(
    { userID: userID },
    { portfolio: { $elemMatch: { coinID } } }
  );

  if (!user) throw new ApolloError('User does not exist', 'AUTHENTICATION_ERROR');

  //buy
  if (buyOrSell.toLowerCase().trim() === 'buy') {
    await buy(user, { coinID, coinName, coinSymbol, quantity, userID });
  } else {
    //sell
    await sell(user, { coinID, coinName, coinSymbol, quantity, userID });
  }
};
