/* eslint-disable no-shadow */
import mongoose from 'mongoose';
import { graphql, GraphQLSchema, subscribe, parse } from 'graphql';
import { buildSchema } from 'type-graphql';

import { getTestingToken } from '../../../utils/testing/getTestingToken';
import { KeyModel } from '../../../models/Key';
import { PriceResolver } from '../prices';
import { APIKeyResolver } from '../../apiKey/APIKey';
import { pubSub } from '../../../utils/redisPubSub';
import { customAuthChecker } from '../../auth/middleware/authChecker';
import { redis } from '../../../utils/redisCache';
import { startPricePublisher, fetchAndPublish } from '../publsihers/pricePublush';
import { PricePayload } from '../../../schemas/PricePayload';
import { fetchPrices } from '../controllers/helpers/fetchCoinPrices';
import { MongoDBConfig } from '../../../config/DbConfig';

let token: string;
let key: string;
let schema: GraphQLSchema;
// eslint-disable-next-line no-undef
let timeout: NodeJS.Timeout;

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

const STREAM_PRICES = `
subscription {
  streamPrices {
    coinID
    currentPrice
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
  await mongoose.connect(`${MongoDBConfig.URI}/test`, {
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
});

afterAll(async () => {
  await KeyModel.deleteMany({});
  await mongoose.disconnect();
  await pubSub.close();
  redis.disconnect();
  clearInterval(timeout);
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
      await redis.incrby(address, 100);
    });

    afterAll(async () => {
      await redis.del(address);
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
      redis.set(
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

describe('prices: streamPrices', () => {
  beforeAll(async () => {
    const result = await graphql(schema, GET_API_KEY, null, {
      token,
    });

    key = result.data?.getAPIKey.key;
    timeout = await startPricePublisher(pubSub, 15);
  });

  it('should subscribe to price stream publisher', async () => {
    expect(async () => {
      const result = (await subscribe(schema, parse(STREAM_PRICES), null, {
        key,
      })) as AsyncIterableIterator<any>;

      const streamData = await (await result.next()).value.data.streamPrices;
      expect(streamData).toBeTruthy();
      expect(streamData).toHaveLength(100);
    }).not.toThrow();
  }, 20000);

  it('should filter streamed prices by coinID variable', async () => {
    const STREAM_PRICES = `
      subscription($coinIDs: [String!]!) {
        streamPrices(data:{coinIDs:$coinIDs}) {
          coinID
          currentPrice
        }
      }`;

    const coinIDs = ['btc', 'eth'];

    expect(async () => {
      const result = (await subscribe(
        schema,
        parse(STREAM_PRICES),
        null,
        { key },
        { coinIDs }
      )) as AsyncIterableIterator<any>;

      const streamData = await (await result.next()).value.data.streamPrices;
      expect(streamData).toBeTruthy();
      expect(streamData).toHaveLength(2);
    }).not.toThrow();
  }, 20000);

  it('should filter coins', async () => {
    const stream = new PriceResolver().streamPrices;
    const coinIDs = ['BTC', 'ETH'];

    const result = stream(
      [{ coinID: 'BTC' }, { coinID: 'ETH' }, { coinID: 'XRP' }] as PricePayload[],
      {
        coinIDs,
      }
    );

    expect(result).not.toEqual([{ coinID: 'BTC' }, { coinID: 'ETH' }, { coinID: 'XRP' }]);
  });

  it('should not filter coins, with null input', () => {
    const stream = new PriceResolver().streamPrices;

    const result = stream(
      [{ coinID: 'BTC' }, { coinID: 'ETH' }, { coinID: 'XRP' }] as PricePayload[],
      { coinIDs: [] }
    );

    expect(result).not.toEqual([{ coinID: 'BTC' }, { coinID: 'ETH' }]);
  });

  describe('fetchAndPublish', () => {
    const subscribeForFirstMessage = async () => {
      return new Promise<Array<Object>>((res) => {
        pubSub.subscribe('PRICES', (mes) => {
          res(mes);
        });
      });
    };

    afterAll(async () => {
      await redis.del('lastPrices');
      await redis.del('rankings');
    });

    it('should publish prices from API', async () => {
      await fetchAndPublish(pubSub);

      const mes = await subscribeForFirstMessage();

      expect(mes).toBeTruthy();
      expect(mes).toHaveLength(100);
      expect(mes[0]).toEqual({
        currentPrice: expect.any(Number),
        name: expect.any(String),
        coinID: expect.any(String),
        priceTimestamp: expect.any(String),
        circulatingSupply: expect.any(Number),
        maxSupply: expect.any(Number),
        marketCap: expect.any(Number),
        oneDayPriceChange: expect.any(Number),
        oneDayPriceChangePct: expect.any(Number),
        oneDayVolume: expect.any(Number),
      });
    });

    it('should publish prices from cache', async () => {
      // sets initial lastPrices cache in redis
      await fetchPrices({ limit: 100, subscription: true });

      await fetchAndPublish(pubSub);

      const mes = await subscribeForFirstMessage();

      expect(mes).toBeTruthy();
      expect(mes).toHaveLength(100);
      expect(mes[0]).toEqual({
        currentPrice: expect.any(Number),
        name: expect.any(String),
        coinID: expect.any(String),
        priceTimestamp: expect.any(String),
        circulatingSupply: expect.any(Number),
        maxSupply: expect.any(Number),
        marketCap: expect.any(Number),
        oneDayPriceChange: expect.any(Number),
        oneDayPriceChangePct: expect.any(Number),
        oneDayVolume: expect.any(Number),
      });
    });
  });
});
