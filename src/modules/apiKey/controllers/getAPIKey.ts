import { ApolloError } from 'apollo-server-express';
import { KeyModel } from '../../../models/Key';
import { generateAPIKey } from '../../../subscriptions/middleware/APIkeys';
import { getTokenUserID } from '../../auth/jwt/getTokenUserID';
import { Context } from '../../auth/middleware/Context';

export const getKey = async (ctx: Context) => {
  const userID = getTokenUserID(ctx);

  try {
    let APIKey = await KeyModel.findOne({ userID });

    if (!APIKey) {
      const key = generateAPIKey();
      APIKey = await KeyModel.create({ userID, key });
    }

    return APIKey.key;
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
