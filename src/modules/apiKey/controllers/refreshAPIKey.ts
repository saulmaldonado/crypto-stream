import { ApolloError } from 'apollo-server-express';
import { KeyModel } from '../../../models/Key';
import { generateAPIKey } from '../../../subscriptions/middleware/APIkeys';
import { getTokenUserID } from '../../auth/jwt/getTokenUserID';
import { Context } from '../../auth/middleware/Context';

export const refreshAPIKey = async (ctx: Context) => {
  const userID = getTokenUserID(ctx);

  try {
    const APIKey = await KeyModel.findOne({ userID });

    if (!APIKey) {
      throw new ApolloError('No API key can be found for user', 'INTERNAL_SERVER_ERROR');
    }

    APIKey.remove();

    const { key, id } = generateAPIKey(ctx);

    const result = await KeyModel.create({ userID, key, _id: id });

    return result.key;
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
