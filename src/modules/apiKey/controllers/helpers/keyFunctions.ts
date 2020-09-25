import { ApolloError } from 'apollo-server-express';
import { v4 } from 'uuid';
import { randomBytes, createCipheriv, createDecipheriv, createHmac } from 'crypto';
import { config } from 'dotenv';

import { getTokenUserID } from '../../../auth/jwt/getTokenUserID';
import { Context } from '../../../auth/middleware/Context';

config();

export type Key = {
  _id: string;
  key: string;
  iv: string;
  encryptedKey: string;
  timestamp: Date;
};

export const genKey = (userID: string, timestamp: Date): Omit<Key, 'timestamp'> => {
  const time = timestamp.getTime();
  const keyPlainText = `${userID}.${time}`;
  const keyString = createHmac('md5', process.env.API_KEY_SECRET!)
    .update(keyPlainText)
    .digest('hex');

  const _id = v4();
  const key = `${_id}.${keyString}`;

  const algorithm = 'aes-256-cbc';
  const iv = randomBytes(16);

  const cipher = createCipheriv(algorithm, Buffer.from(process.env.API_KEY_SECRET!, 'hex'), iv);

  let encryptedKey = cipher.update(key, 'utf8', 'hex');
  encryptedKey += cipher.final('hex');

  return { _id, encryptedKey, iv: iv.toString('hex'), key };
};

export const generateAPIKey = (token: Context): Key => {
  const userID = getTokenUserID(token);
  const timestamp = new Date();
  try {
    const { key, _id, encryptedKey, iv } = genKey(userID, timestamp);

    return { _id, key, encryptedKey, timestamp, iv };
  } catch (error) {
    throw new ApolloError(error, 'INTERNAL_SERVER_ERROR');
  }
};

export const decryptKey = (encryptedKey: string, iv: string): string => {
  const decipher = createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.API_KEY_SECRET!, 'hex'),
    Buffer.from(iv, 'hex')
  );
  let APIKey = decipher.update(encryptedKey, 'hex', 'utf8');
  APIKey += decipher.final('utf8');

  return APIKey;
};
