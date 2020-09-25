import { mongoose } from '@typegoose/typegoose';
import { config } from 'dotenv';
import { MongoDBConfig } from '../../../config/DbConfig';
import { KeyModel } from '../../../models/Key';
import * as tokenMethods from '../../auth/jwt/getTokenUserID';
import { Context } from '../../auth/middleware/Context';
import { generateAPIKey } from '../controllers/helpers/keyFunctions';
import { refreshAPIKey } from '../controllers/refreshAPIKey';

config();

const userID: string = 'auth0|5f6aa02c4419aa00717f9ee8';

beforeAll(async () => {
  await mongoose.connect(`${MongoDBConfig.URI}/test2`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('refreshAPIkey: controller', () => {
  let getTokenUserIDMock: jest.SpyInstance<string, [Context]>;

  let encryptedKey;
  let iv;
  let _id;
  let timestamp: Date;
  let key: string;

  beforeAll(async () => {
    getTokenUserIDMock = jest.spyOn(tokenMethods, 'getTokenUserID');
    getTokenUserIDMock.mockImplementation(() => userID);

    ({ encryptedKey, iv, _id, timestamp, key } = generateAPIKey({} as Context));

    await KeyModel.create({ _id, encryptedKey, iv, timestamp, userID });
  });

  afterEach(async () => {
    await KeyModel.deleteMany({});
  });

  afterAll(async () => {
    getTokenUserIDMock.mockRestore();
  });

  it('should return a new APIKey object', async () => {
    const APIKey = await refreshAPIKey({} as Context);

    expect(APIKey).toBeTruthy();

    expect(APIKey).not.toEqual({
      key,
      timestamp,
    });
  });

  it('should fail if there is not an existing API key for user in database', async () => {
    await expect(async () => {
      await refreshAPIKey({} as Context);
    }).rejects.toThrow();
  });
});
