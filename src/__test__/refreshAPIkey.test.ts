import { mongoose } from '@typegoose/typegoose';
import { config } from 'dotenv';
import { KeyModel } from '../models/Key';
import * as tokenMethods from '../modules/auth/jwt/getTokenUserID';
import { Context } from '../modules/auth/middleware/Context';
import { generateAPIKey } from '../modules/apiKey/controllers/helpers/keyFunctions';
import { refreshAPIKey } from '../modules/apiKey/controllers/refreshAPIKey';

config();

const userID: string = 'auth0|5f6aa02c4419aa00717f9ee8';

let getTokenUserIDMock: jest.SpyInstance<string, [Context]>;

beforeAll(async () => {
  await mongoose.connect(`${process.env.MONGO_URI}/test2`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  getTokenUserIDMock = jest.spyOn(tokenMethods, 'getTokenUserID');
  getTokenUserIDMock.mockImplementation(() => userID);
});

afterAll(async () => {
  getTokenUserIDMock.mockRestore();
  await mongoose.disconnect();
});

describe('refreshAPIkey: controller', () => {
  let encryptedKey;
  let iv;
  let _id;
  let timestamp: Date;
  let key: string;

  beforeAll(async () => {
    ({ encryptedKey, iv, _id, timestamp, key } = generateAPIKey({} as Context));

    await KeyModel.create({ _id, encryptedKey, iv, timestamp, userID });
  });

  afterEach(async () => {
    await KeyModel.deleteMany({});
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

  describe('Failure edge case', () => {
    let keyModelCreateMock: jest.SpyInstance<
      ReturnType<typeof KeyModel.create>,
      Parameters<typeof KeyModel.create>
    >;
    beforeAll(async () => {
      ({ encryptedKey, iv, _id, timestamp, key } = generateAPIKey({} as Context));
      await KeyModel.create({ _id, encryptedKey, iv, timestamp, userID });

      keyModelCreateMock = jest.spyOn((await import('../models/Key')).KeyModel, 'create');
      keyModelCreateMock.mockImplementation(() => {
        throw new Error();
      });
    });

    afterAll(async () => {
      keyModelCreateMock.mockRestore();
    });

    it('should throw error on database error', async () => {
      await expect(async () => {
        await refreshAPIKey({} as Context);
      }).rejects.toThrow();
    });
  });
});
