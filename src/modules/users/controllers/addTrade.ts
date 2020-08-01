import { ApolloError } from 'apollo-server-express';
import { CoinModel } from '../../../models/Coin';
import { UsersModel } from '../../../models/Users';
import { Coin } from '../../../schemas/Coin';
import { AddTransactionInput } from '../input/AddTransactionInput';

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
    //Add new coin
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
        },
        {
          new: true,
        }
      );
      //update quantity of coin
    } else {
      user.portfolio[0].quantity += quantity;
      await user.save();
    }
    //sell coin
  } else {
    if (!user.portfolio?.[0] || user.portfolio![0].quantity < quantity) {
      throw new ApolloError('Insufficient coins', 'BAD_USER_INPUT');
    } else if (user.portfolio[0].quantity === quantity) {
      await user.updateOne({ $pull: { portfolio: { coinID: { $in: coinID } } } });
    } else {
      user.portfolio[0].quantity -= quantity;
      await user.save();
    }
  }
};
