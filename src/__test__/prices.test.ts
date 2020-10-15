/* eslint-disable no-undef */
/* eslint-disable no-shadow */
import mongoose from 'mongoose';
import { graphql, GraphQLSchema } from 'graphql';

import { config } from 'dotenv';
import { KeyModel } from '../models/Key';
import { PriceResolver } from '../modules/prices/prices';
import { APIKeyResolver } from '../modules/apiKey/APIKey';
import { pubSub } from '../utils/redisPubSub';
import { redis } from '../utils/redisCache';
import { rateLimiters } from '../config/RateLimitConfig';
import { createSchemaAndToken } from './utils/getTestingApiKey';

config();

let token: string;
let key: string;
let schema: GraphQLSchema;

const GET_CURRENCY_RANKINGS = `
query {
  getCurrencyRankings {
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

const GET_CURRENCY_RANKINGS_PARAMS = `
query($limit: Int) {
  getCurrencyRankings(limit: $limit) {
    ranking
    coinID
    name
  }
}`;

beforeAll(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/pricesTest`, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });

    ({ schema, token } = await createSchemaAndToken([PriceResolver, APIKeyResolver], pubSub));
  } catch (error) {
    fail(error);
  }
});

afterAll(async () => {
  await KeyModel.deleteMany({});
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();
  await pubSub.close();
  redis.disconnect();
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
    const result = await graphql(schema, GET_CURRENCY_RANKINGS, null, {
      key,
    });
    expect(result).toBeTruthy();
  });

  it('should limit data length when argument is passed in', async () => {
    const limit: number = 10;
    const result = await graphql(schema, GET_CURRENCY_RANKINGS_PARAMS, null, { key }, { limit });
    expect(result.data).toBeTruthy();
    expect(result.data?.getCurrencyRankings.length).toBe(10);
  });

  describe('getRankings: from cache', () => {
    let coins: { name: string; coinID: string }[];
    beforeAll(async () => {
      coins = [
        { name: 'bitcoin', coinID: 'BTC' },
        { name: 'ethereum', coinID: 'ETH' },
      ];

      await redis.set('rankings', JSON.stringify(coins));
    });

    it('should get rankings from cache', async () => {
      const rankings = await graphql(
        schema,
        GET_CURRENCY_RANKINGS_PARAMS,
        null,
        { key },
        { limit: 2 }
      );

      expect(rankings.data?.getCurrencyRankings).toEqual([
        { name: 'bitcoin', coinID: 'BTC', ranking: 1 },
        { name: 'ethereum', coinID: 'ETH', ranking: 2 },
      ]);
    });
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
      const result = await graphql(schema, GET_CURRENCY_RANKINGS, null, {
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
      await redis.del(`${address} HIT ENDPOINT`);
    });

    afterEach(async () => {
      await redis.del(`${address} HIT ENDPOINT`);
    });

    it('should rate limit with address if value in redis at or above limit', async () => {
      await redis.incrby(`${address} HIT ENDPOINT`, 50);

      const result = await graphql(schema, GET_COIN_PRICES, null, { address }, { coinIDs });

      expect(result.errors).toBeTruthy();
    });

    it('should rate limit with address after certain number of requests', async () => {
      const limit = rateLimiters.getPrices.UNAUTHENTICATED;

      const promises = [];

      for (let i = 0; i < limit; i += 1) {
        promises.push(graphql(schema, GET_COIN_PRICES, null, { address }, { coinIDs }));
      }

      await Promise.all(promises);

      const result = await graphql(schema, GET_COIN_PRICES, null, { address }, { coinIDs });

      expect(result.errors).toBeTruthy();
    }, 10000);
  });
});
