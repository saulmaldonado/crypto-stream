import { ApolloError } from 'apollo-server-express';

import { CoinModel } from '../../../../models/Coin';
import { UsersModel } from '../../../../models/Users';
import { trade } from '../addTrade';

/**
 * Adds coin and updates its quantity in the users portfolio
 * @param user
 * @param param1
 */
export const buy: trade = async (user, { coinID, coinName, coinSymbol, quantity, userID }) => {
  // Add new coin to portfolio if coin is not initially found
  try {
    if (!user.portfolio?.[0]) {
      const coin = new CoinModel({
        coinName,
        coinID,
        coinSymbol,
        quantity,
      });
      await UsersModel.findOneAndUpdate(
        { userID },
        {
          $push: { portfolio: coin },
        }
      );
    } else {
      // update quantity of existing coin
      user.portfolio[0].quantity += quantity;
      await user.save();
    }
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
