import { mongoose } from '@typegoose/typegoose';
import { KeyModel } from '../../../models/Key';
import { Context } from '../../auth/middleware/Context';
import * as tokenMethods from '../../auth/jwt/getTokenUserID';
import { getKey } from '../controllers/getAPIKey';
import { generateAPIKey } from '../controllers/helpers/keyFunctions';
import { config } from 'dotenv';
import { redis } from '../../../utils/redisCache';
config();

let userID: string = 'auth0|5f6aa02c4419aa00717f9ee8';

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test5', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('getAPIKey: controller', () => {
  let getTokenUserIDMock: jest.SpyInstance<string, [Context]>;

  beforeAll(() => {
    getTokenUserIDMock = jest.spyOn(tokenMethods, 'getTokenUserID');
    getTokenUserIDMock.mockImplementation(() => userID);
  });

  afterAll(() => {
    getTokenUserIDMock.mockRestore();
    redis.disconnect();
  });

  afterEach(async () => {
    await KeyModel.deleteMany({});
  });

  it('should return a new APIKey object', async () => {
    const APIKey = await getKey({} as Context);

    expect(APIKey).toEqual({
      key: expect.any(String),
      timestamp: expect.any(Date),
    });
  });

  describe('getAPIKey: controller existing key in db', () => {
    let encryptedKey;
    let iv;
    let _id;
    let timestamp: Date;
    let key: string;

    beforeAll(async () => {
      ({ encryptedKey, iv, _id, timestamp, key } = generateAPIKey({} as Context));

      await KeyModel.create({ _id, encryptedKey, iv, timestamp, userID });
    });

    it('should return the same existing APIKey object', async () => {
      const APIKey = await getKey({} as Context);

      expect(APIKey).toEqual({
        key,
        timestamp,
      });
    });
  });
});
