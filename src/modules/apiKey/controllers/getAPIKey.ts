import { ApolloError } from 'apollo-server-express';

import { KeyModel } from '../../../models/Key';
import { APIKey } from '../../../schemas/APIkey';
import { getTokenUserID } from '../../auth/jwt/getTokenUserID';
import { Context } from '../../auth/middleware/Context';
import { decryptKey, generateAPIKey } from './helpers/keyFunctions';

export const getKey = async (ctx: Context): Promise<APIKey> => {
  const userID = getTokenUserID(ctx);

  try {
    let APIKey = await KeyModel.findOne({ userID });

    if (!APIKey) {
      const { _id, key, encryptedKey, timestamp, iv } = generateAPIKey(ctx);
      APIKey = await KeyModel.create({ _id, encryptedKey, userID, timestamp, iv });
      return { key, timestamp };
    }

    const key = decryptKey(APIKey.encryptedKey, APIKey.iv);
    const timestamp = APIKey.timestamp;
    return { key, timestamp };
  } catch (error) {
    throw new ApolloError(error, 'INTERNAL_SERVER_ERROR');
  }
};
