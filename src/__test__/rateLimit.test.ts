import { NextFn, ResolverData } from 'type-graphql';
import { config } from 'dotenv';
import mongoose from 'mongoose';
import { redisConfig } from '../config/RedisConfig';
import { redis } from '../utils/redisCache';
import { Context } from '../modules/auth/middleware/Context';
import { rateLimitAnon } from '../modules/auth/middleware/rateLimitAnon';
import { rateLimitAll } from '../modules/auth/middleware/rateLimitAll';
import { getTestingApiKey } from './utils/getTestingApiKey';

config();

const address: string = '1.1.1.1';
let APIKey: string;

beforeAll(async () => {
  await mongoose.connect(`${process.env.MONGO_URI}/rateLimitTest`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });

  APIKey = await getTestingApiKey();
}, 60000);

afterAll(async () => {
  redis.disconnect();
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
});

afterEach(async () => {
  await redis.del(address);
});

describe('rateLimit: rateLimitAnon', () => {
  it('should enter address into redis rate limiting store', async () => {
    const next: NextFn = jest.fn();

    const middleware = rateLimitAnon(100);

    const context = { context: { address } } as ResolverData<Context>;

    await middleware(context, next);
    expect(next).toBeCalled();

    const result = await redis.get(address);
    expect(result).toBe('1');
    const rate = await redis.ttl(address);
    expect(rate).toBeLessThanOrEqual(redisConfig.ONE_DAY);
  });

  it('should set expiry for ratelimit key in store for rateLimitAll: unauthenticated', async () => {
    const next: NextFn = jest.fn();

    const middleware = rateLimitAll(100, 50);

    const context = { context: { address } } as ResolverData<Context>;

    await middleware(context, next);
    expect(next).toBeCalled();

    const rateLimitKey = `${address} HIT ENDPOINT`;

    const result = await redis.get(rateLimitKey);
    expect(result).toBe('1');

    const rate = await redis.ttl(rateLimitKey);
    expect(rate).toBeLessThanOrEqual(redisConfig.ONE_DAY);
  });

  it('should set expiry for ratelimit key in store for rateLimitAll: authenticated', async () => {
    const next: NextFn = jest.fn();

    const middleware = rateLimitAll(100, 50);

    const context = { context: { key: APIKey } } as ResolverData<Context>;

    await middleware(context, next);
    expect(next).toBeCalled();

    const rateLimitKey = `${APIKey} HIT ENDPOINT`;

    const result = await redis.get(rateLimitKey);
    expect(result).toBe('1');

    const rate = await redis.ttl(rateLimitKey);
    expect(rate).toBeLessThanOrEqual(redisConfig.ONE_DAY);
  });
});
