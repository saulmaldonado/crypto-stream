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
  let getTokenUserIDMock: jest.SpyInstance<
    ReturnType<typeof tokenMethods.getTokenUserID>,
    Parameters<typeof tokenMethods.getTokenUserID>
  >;

  beforeAll(() => {
    getTokenUserIDMock = jest.spyOn(tokenMethods, 'getTokenUserID');
    getTokenUserIDMock.mockImplementation(() => userID);
  });

  afterAll(() => {
    getTokenUserIDMock.mockRestore();
  });

  it('should return a complete Key object', () => {
    const keyObj = generateAPIKey({} as Context);
    expect(keyObj).toEqual({
      _id: expect.any(String),
      encryptedKey: expect.any(String),
      iv: expect.any(String),
      key: expect.any(String),
      timestamp: expect.any(Date),
    });
  });

  describe('failure edge case', () => {
    let genKeyMock: jest.SpyInstance<ReturnType<typeof genKey>, Parameters<typeof genKey>>;

    beforeAll(async () => {
      genKeyMock = jest.spyOn(
        await import('../modules/apiKey/controllers/helpers/keyFunctions'),
        'genKey'
      );
      genKeyMock.mockImplementation(() => {
        throw new Error();
      });
    });

    afterAll(() => {
      genKeyMock.mockRestore();
    });

    it('should throw server error on failure', async () => {
      expect(() => {
        generateAPIKey({} as Context);
      }).toThrow();
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
