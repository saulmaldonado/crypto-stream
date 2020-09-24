import { config } from 'dotenv';
import { getTestingToken } from '../../../utils/testing/getTestingToken';
import { NextFn, ResolverData } from 'type-graphql';
import { checkAPIKey } from '../middleware/checkAPIKey';
import { Context } from '../../auth/middleware/Context';
import { getKey } from '../controllers/getAPIKey';
import { KeyModel } from '../../../models/Key';
import mongoose from 'mongoose';
import { redis } from '../../../utils/redisCache';

config();
let token: string;
let key: string;

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test4', {
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

  it('should disallow call with invalid token', () => {
    const next = jest.fn() as NextFn;

    key = '123456';

    const middleware = checkAPIKey();

    expect(async () => {
      await middleware({ context: { key } } as ResolverData<Context>, next);
    }).rejects.toThrow();
  });

  it('should disallow call with tampered token signature', async () => {
    const next = jest.fn() as NextFn;

    let [id, signature] = key.split('.');

    signature = 'sdkfljskdlgjdfgl';

    key = [id, signature].join('.');

    const middleware = checkAPIKey();

    expect(async () => {
      await middleware({ context: { key } } as ResolverData<Context>, next);
    }).rejects.toThrow();
  });
});
