/* eslint-disable no-console */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
import { graphql, GraphQLSchema, subscribe, parse } from 'graphql';
import mongoose from 'mongoose';
import { buildSchema } from 'type-graphql';
import { PricePayload } from '../../../schemas/PricePayload';
import { redis } from '../../../utils/redisCache';
import { pubSub } from '../../../utils/redisPubSub';
import { fetchPrices } from '../controllers/helpers/fetchCoinPrices';
import { PriceResolver } from '../prices';
import { startPricePublisher, fetchAndPublish } from '../publsihers/pricePublush';
import { KeyModel } from '../../../models/Key';
import { getTestingToken } from '../../../utils/testing/getTestingToken';
import { APIKeyResolver } from '../../apiKey/APIKey';
import { customAuthChecker } from '../../auth/middleware/authChecker';

let token: string;
let key: string;
let schema: GraphQLSchema;

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

beforeAll(async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URI}/test9`, {
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
  try {
    await KeyModel.deleteMany({});
    await mongoose.disconnect();
    await pubSub.close();
    redis.disconnect();
  } catch (error) {
    fail(error);
  }
});

describe('prices: streamPrices', () => {
  let timeout: NodeJS.Timeout;

  beforeAll(async () => {
    const result = await graphql(schema, GET_API_KEY, null, {
      token,
    });

    key = result.data?.getAPIKey.key;
    timeout = startPricePublisher(pubSub, 15);
  });
  afterAll(() => {
    clearTimeout(timeout);
    clearInterval(timeout);
  });

  it('should subscribe to price stream publisher', async () => {
    expect(async () => {
      const result = (await subscribe(schema, parse(STREAM_PRICES), null, {
        key,
      })) as AsyncIterableIterator<any>;

      const streamData = await (await result!.next()).value.data.streamPrices;
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
  }, 20000);

  it('should not filter coins, with null input', () => {
    const stream = new PriceResolver().streamPrices;

    const result = stream(
      [{ coinID: 'BTC' }, { coinID: 'ETH' }, { coinID: 'XRP' }] as PricePayload[],
      { coinIDs: [] }
    );

    expect(result).not.toEqual([{ coinID: 'BTC' }, { coinID: 'ETH' }]);
  }, 20000);

  it('should fail when given invalid coin IDs', () => {
    const stream = new PriceResolver().streamPrices;

    const result = stream(
      [{ coinID: 'BTC' }, { coinID: 'ETH' }, { coinID: 'XRP' }] as PricePayload[],
      { coinIDs: ['HGL', 'BTC', 'ETH'] }
    );

    expect(result).not.toEqual([{ coinID: 'HGL' }, { coinID: 'BTC' }, { coinID: 'ETH' }]);
  }, 20000);

  describe('fetchAndPublish', () => {
    let subscribeForFirstMessage: () => Promise<Object[]>;

    beforeAll(() => {
      try {
        subscribeForFirstMessage = async () => {
          return new Promise<Array<Object>>((res) => {
            pubSub.subscribe('PRICES', (mes) => {
              res(mes);
            });
          });
        };
      } catch (error) {
        console.error(error);
      }
    });

    afterAll(async () => {
      try {
        await redis.del('lastPrices');
      } catch (error) {
        fail(error);
      }
    });

    afterEach(async () => {
      try {
        await redis.del('rankings');
      } catch (error) {
        console.log(error);
      }
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
