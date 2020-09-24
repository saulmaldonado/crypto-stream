import { ApolloError } from 'apollo-server-express';
import { KeyModel } from '../../../models/Key';
import { APIKey } from '../../../schemas/APIkey';
import { getTokenUserID } from '../../auth/jwt/getTokenUserID';
import { Context } from '../../auth/middleware/Context';
import { generateAPIKey } from './helpers/keyFunctions';

export const refreshAPIKey = async (ctx: Context): Promise<APIKey> => {
  const userID = getTokenUserID(ctx);

  try {
    const APIKey = await KeyModel.findOne({ userID });

    if (!APIKey) {
      throw new ApolloError('No API key can be found for user', 'INTERNAL_SERVER_ERROR');
    }

    APIKey.remove();

    const { key, _id, encryptedKey, timestamp, iv } = generateAPIKey(ctx);

    try {
      await KeyModel.create({ _id, encryptedKey, userID, timestamp, iv });
    } catch (error) {
      throw new ApolloError(error, 'DATABASE_ERROR');
    }

    return { key, timestamp };
  } catch (error) {
    throw new ApolloError(error, 'DATABASE_ERROR');
  }
};
