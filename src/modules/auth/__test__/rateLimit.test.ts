import { NextFn, ResolverData } from 'type-graphql';
import { redisConfig } from '../../../config/RedisConfig';
import { redis } from '../../../utils/redisCache';
import { Context } from '../middleware/Context';
import { rateLimitAnon } from '../middleware/rateLimit';

const address: string = '1.1.1.1';

beforeAll(async () => {});

afterAll(async () => {
  redis.disconnect();
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
});
