import { config } from 'dotenv';
import mongoose from 'mongoose';
import { NextFn, ResolverData } from 'type-graphql';

import { getTestingToken } from './utils/getTestingToken';
import { checkAPIKey } from '../modules/apiKey/middleware/checkAPIKey';
import { Context } from '../modules/auth/middleware/Context';
import { getKey } from '../modules/apiKey/controllers/getAPIKey';
import { KeyModel } from '../models/Key';
import { redis } from '../utils/redisCache';

config();
let token: string;
let key: string;

beforeAll(async () => {
  await mongoose.connect(`${process.env.MONGO_URI}/test4`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
});

beforeEach(async () => {
  token = await getTestingToken();
  ({ key } = await getKey({ token } as Context));
});

afterAll(async () => {
  redis.disconnect();
  await KeyModel.deleteMany({});
  await mongoose.disconnect();
});

describe('checkAPIKey: checkAPIKey', () => {
  it('should allow calls without API key', async () => {
    const next = jest.fn() as NextFn;

    const middleware = checkAPIKey();

    await middleware({ context: {} } as ResolverData<Context>, next);
    next();

    expect(next).toBeCalled();
  });

  it('should validate and allow calls with valid token', async () => {
    const next = jest.fn() as NextFn;

    const middleware = checkAPIKey();

    await middleware({ context: { key } } as ResolverData<Context>, next);

    expect(next).toBeCalled();
  });

  it('should disallow call with invalid token', async () => {
    const next = jest.fn() as NextFn;

    key = '123456';

    const middleware = checkAPIKey();

    await expect(async () => {
      await middleware({ context: { key } } as ResolverData<Context>, next);
    }).rejects.toThrow();
  });

  it('should disallow call with tampered token signature', async () => {
    const next = jest.fn() as NextFn;

    let [, signature] = key.split('.');
    const [id] = key.split('.');

    signature = 'sdkfljskdlgjdfgl';

    key = [id, signature].join('.');

    const middleware = checkAPIKey();

    await expect(async () => {
      await middleware({ context: { key } } as ResolverData<Context>, next);
    }).rejects.toThrow();
  });
});
