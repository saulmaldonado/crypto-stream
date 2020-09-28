/* eslint-disable no-undef */
/* eslint-disable no-shadow */
import mongoose from 'mongoose';
import { graphql, GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';

import { config } from 'dotenv';
import { getTestingToken } from '../../../utils/testing/getTestingToken';
import { KeyModel } from '../../../models/Key';
import { PriceResolver } from '../prices';
import { APIKeyResolver } from '../../apiKey/APIKey';
import { pubSub } from '../../../utils/redisPubSub';
import { customAuthChecker } from '../../auth/middleware/authChecker';
import { redis } from '../../../utils/redisCache';

config();

let token: string;
let key: string;
let schema: GraphQLSchema;

const GET_COIN_RANKINGS = `
query {
  getCoinRankings {
    ranking
    coinID
    name
  }
}`;

const GET_API_KEY = `
query {
  getAPIKey {
    timestamp
    key
  }
}`;

const GET_COIN_PRICES = `
query($coinIDs: [String!]!) {
  getPrices(data:{coinIDs:$coinIDs}) {
    currentPrice
    name
  }
}`;

const GET_COIN_RANKINGS_PARAMS = `
query($limit: Int) {
  getCoinRankings(limit: $limit) {
    ranking
    coinID
    name
  }
}`;

beforeAll(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/test`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    token = await getTestingToken();

    schema = await buildSchema({
      resolvers: [PriceResolver, APIKeyResolver],
      authChecker: customAuthChecker,
      pubSub,
    });
  } catch (error) {
    fail(error);
  }
});

afterAll(async () => {
  await KeyModel.deleteMany({});
  try {
    await mongoose.disconnect();
    await pubSub.close();
    redis.disconnect();
  } catch (error) {
    fail(error);
  }
});

describe('prices: getCoinRankings', () => {
  beforeAll(async () => {
    const result = await graphql(schema, GET_API_KEY, null, {
      token,
    });
    key = result.data?.getAPIKey.key;
  });
  afterEach(async () => {
    await redis.del('rankings');
  });
  it('should return ranking data', async () => {
    const result = await graphql(schema, GET_COIN_RANKINGS, null, {
      key,
    });
    expect(result).toBeTruthy();
  });
  it('should limit data length when argument is passed in', async () => {
    const limit: number = 10;
    const result = await graphql(schema, GET_COIN_RANKINGS_PARAMS, null, { key }, { limit });
    expect(result.data).toBeTruthy();
    expect(result.data?.getCoinRankings.length).toBe(10);
  });
  describe('ratelimiting: address', () => {
    const address = '0.0.0.0';
    beforeAll(async () => {
      try {
        await redis.incrby(address, 100);
      } catch (error) {
        fail(error);
      }
    });
    afterAll(async () => {
      try {
        await redis.del(address);
      } catch (error) {
        fail(error);
      }
    });
    it('should rate limit after certain number of requests', async () => {
      const result = await graphql(schema, GET_COIN_RANKINGS, null, {
        address,
      });
      expect(result.errors).toBeTruthy();
    });
  });
});

describe('prices: getPrices', () => {
  const coinIDs = ['btc', 'eth'];

  beforeAll(async () => {
    const result = await graphql(schema, GET_API_KEY, null, {
      token,
    });

    key = result.data?.getAPIKey.key;
  });

  it('return market data for the given coinIDs', async () => {
    const result = await graphql(schema, GET_COIN_PRICES, null, { key }, { coinIDs });

    expect(result.data).toBeTruthy();
    expect(result.data?.getPrices[0].name).toBe('Bitcoin');
    expect(result.data?.getPrices[1].name).toBe('Ethereum');
  });

  describe('getCoinPrices', () => {
    beforeAll(async () => {
      // set mock cache data
      await redis.set(
        'lastPrices',
        JSON.stringify([
          { coinID: 'BTC', currentPrice: 123456, name: 'bitcoin' },
          { coinID: 'ETH', currentPrice: 123456, name: 'ethereum' },
        ])
      );
    });

    afterAll(async () => {
      await redis.del('lastPrices');
    });

    it('should fetch prices for coins not in cache', async () => {
      const coinIDs = ['btc', 'eth', 'tdx'];
      const result = await graphql(schema, GET_COIN_PRICES, null, { key }, { coinIDs });

      expect(result.data?.getPrices).toBeTruthy();
      expect(result.data?.getPrices).toEqual([
        { currentPrice: expect.any(Number), name: 'bitcoin' },
        { currentPrice: expect.any(Number), name: 'ethereum' },
        { currentPrice: expect.any(Number), name: 'Tidex Token' },
      ]);
    });
  });

  describe('ratelimiting: key', () => {
    beforeAll(async () => {
      await redis.incrby(`${key} HIT ENDPOINT`, 100);
    });
    afterAll(async () => {
      await redis.del(`${key} HIT ENDPOINT`);
    });

    it('should rate limit with key after certain number of requests', async () => {
      const result = await graphql(schema, GET_COIN_PRICES, null, { key }, { coinIDs });

      expect(result.errors).toBeTruthy();
    });
  });

  describe('ratelimiting: address', () => {
    const address = '0.0.0.0';
    beforeAll(async () => {
      await redis.incrby(`${address} HIT ENDPOINT`, 50);
    });

    afterAll(async () => {
      await redis.del(`${address} HIT ENDPOINT`);
    });

    it('should rate limit with address after certain number of request', async () => {
      const result = await graphql(schema, GET_COIN_PRICES, null, { address }, { coinIDs });

      expect(result.errors).toBeTruthy();
    });
  });
});
