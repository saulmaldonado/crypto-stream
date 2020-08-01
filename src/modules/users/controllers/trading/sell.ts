import { ApolloError } from 'apollo-server-express';

import { trade } from '../addTrade';

export const sell: trade = async (user, { coinID, quantity }) => {
  try {
    if (!user.portfolio?.[0] || user.portfolio![0].quantity < quantity) {
      throw new ApolloError('Insufficient coins', 'BAD_USER_INPUT');
    } else if (user.portfolio[0].quantity === quantity) {
      await user.updateOne({ $pull: { portfolio: { coinID: { $in: coinID } } } });
    } else {
      user.portfolio[0].quantity -= quantity;
      await user.save();
    }
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
