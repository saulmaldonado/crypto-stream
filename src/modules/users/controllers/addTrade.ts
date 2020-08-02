import { DocumentType } from '@typegoose/typegoose';
import { ApolloError } from 'apollo-server-express';

import { PortfolioModel } from '../../../models/Users';
import { Portfolio } from '../../../schemas/Portfolio';
import { AddTransactionInput } from '../input/AddTransactionInput';
import { buy } from './trading/buy';
import { sell } from './trading/sell';

export type UserPortfolio = DocumentType<Pick<Portfolio, 'portfolio' | 'id'>>;
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
  portfolioID,
}: AddTransactionInput) => {
  const user = await PortfolioModel.findOne(
    { _id: portfolioID },
    { portfolio: { $elemMatch: { coinID } } }
  );

  if (!user) throw new ApolloError('User does not exist', 'AUTHENTICATION_ERROR');

  //buy
  if (buyOrSell.toLowerCase().trim() === 'buy') {
    await buy(user, { coinID, coinName, coinSymbol, quantity, portfolioID });
  } else {
    //sell
    await sell(user, { coinID, coinName, coinSymbol, quantity, portfolioID });
  }
};
