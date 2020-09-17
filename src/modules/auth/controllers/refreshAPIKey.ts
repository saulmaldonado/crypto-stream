import { ApolloError } from 'apollo-server-express';
import { KeyModel } from '../../../models/Key';
import { generateAPIKey } from '../api/APIkeys';
import { getTokenUserID } from '../jwt/getTokenUserID';
import { Context } from '../middleware/Context';

export const refreshAPIKey = async (ctx: Context) => {
  const userID = getTokenUserID(ctx);

  try {
    let APIKey = await KeyModel.findOne({ userID });

    if (!APIKey) {
      throw new ApolloError('No API Key for user', 'INTERNAL_SERVER_ERROR');
    }

    const key = generateAPIKey();
    APIKey.key = key;
    const result = await APIKey.save();

    return result.key;
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
