import { ApolloError } from 'apollo-server-express';

import { KeyModel } from '../../../models/Key';
import { getTokenUserID } from '../../auth/jwt/getTokenUserID';
import { Context } from '../../auth/middleware/Context';
import { generateAPIKey, genKey } from './helpers/keyFunctions';

export const getKey = async (ctx: Context) => {
  const userID = getTokenUserID(ctx);

  try {
    let APIKey = await KeyModel.findOne({ userID });

    if (!APIKey) {
      const { _id, key, hashedKey, timestamp } = generateAPIKey(ctx);
      APIKey = await KeyModel.create({ _id, hashedKey, userID, timestamp });
      return { key, timestamp };
    }

    const { key, timestamp } = genKey(userID, APIKey.timestamp, APIKey._id);
    return { key, timestamp };
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
