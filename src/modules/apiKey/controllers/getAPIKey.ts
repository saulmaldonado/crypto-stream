import { ApolloError } from 'apollo-server-express';

import { KeyModel } from '../../../models/Key';
import { APIKey } from '../../../schemas/APIkey';
import { getTokenUserID } from '../../auth/jwt/getTokenUserID';
import { Context } from '../../auth/middleware/Context';
import { decryptKey, generateAPIKey } from './helpers/keyFunctions';

export const getKey = async (ctx: Context): Promise<APIKey> => {
  const userID = getTokenUserID(ctx);

  try {
    let APIKeyObject = await KeyModel.findOne({ userID });

    if (!APIKeyObject) {
      const { _id, key, encryptedKey, timestamp, iv } = generateAPIKey(ctx);
      APIKeyObject = await KeyModel.create({ _id, encryptedKey, userID, timestamp, iv });
      return { key, timestamp };
    }

    const key = decryptKey(APIKeyObject.encryptedKey, APIKeyObject.iv);
    const { timestamp } = APIKeyObject;
    return { key, timestamp };
  } catch (error) {
    throw new ApolloError(error, 'INTERNAL_SERVER_ERROR');
  }
};
