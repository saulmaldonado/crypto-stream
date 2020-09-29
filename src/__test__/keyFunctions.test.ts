import { config } from 'dotenv';
import { validate } from 'uuid';
import * as tokenMethods from '../modules/auth/jwt/getTokenUserID';
import { Context } from '../modules/auth/middleware/Context';
import {
  decryptKey,
  generateAPIKey,
  genKey,
  Key,
} from '../modules/apiKey/controllers/helpers/keyFunctions';

config();

const time: Date = new Date('2020-09-23T01:17:22.376Z');
const userID: string = 'auth0|5f6aa02c4419aa00717f9ee8';

describe('keyFunctions: genKey', () => {
  let generatedKey: Omit<Key, 'timestamp'>;

  beforeAll(() => {
    generatedKey = genKey(userID, time);
  });

  it('should return the expected api key object', () => {
    expect(generatedKey).toEqual(
      expect.objectContaining({
        _id: expect.any(String),
        encryptedKey: expect.any(String),
        iv: expect.any(String),
        key: expect.any(String),
      })
    );
  });

  it('should return a valid api key', () => {
    const [uuid, signature] = generatedKey.key.split('.');
    expect(validate(uuid)).toBeTruthy();
    expect(Buffer.from(signature).byteLength).toBe(32);
  });
});

describe('keyFunctions: generateAPIKey', () => {
  let getTokenUserIDMock: jest.SpyInstance<string, [Context]>;

  afterAll(() => {
    getTokenUserIDMock.mockRestore();
  });

  it('should return a complete Key object', () => {
    getTokenUserIDMock = jest.spyOn(tokenMethods, 'getTokenUserID');
    getTokenUserIDMock.mockImplementation(() => 'auth0|5f6aa02c4419aa00717f9ee8');
    const keyObj = generateAPIKey({} as Context);
    expect(keyObj).toEqual({
      _id: expect.any(String),
      encryptedKey: expect.any(String),
      iv: expect.any(String),
      key: expect.any(String),
      timestamp: expect.any(Date),
    });
  });
});

describe('keyFunctions: decryptKey', () => {
  let encryptedKey: string;
  let iv: string;

  beforeAll(() => {
    ({ encryptedKey, iv } = genKey(userID, time));
  });

  it('should return a valid decrypted key', () => {
    const key = decryptKey(encryptedKey, iv);
    expect(key).toEqual(expect.any(String));
  });
});
