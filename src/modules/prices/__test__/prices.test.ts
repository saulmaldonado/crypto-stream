import { getTestingToken } from '../../../utils/testing/getTestingToken';
import mongoose from 'mongoose';
import { graphql, GraphQLSchema, subscribe, parse } from 'graphql';
import { KeyModel } from '../../../models/Key';
import { buildSchema } from 'type-graphql';
import { PriceResolver } from '../prices';
import { APIKeyResolver } from '../../apiKey/APIKey';
import { pubSub } from '../../../utils/redisPubSub';
import { customAuthChecker } from '../../auth/middleware/authChecker';
import { redis } from '../../../utils/redisCache';
import { startPricePublisher } from '../publsihers/pricePublush';

let token: string;
let key: string;
let schema: GraphQLSchema;
let timeout: NodeJS.Timeout;

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test', {
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
  await mongoose.connection.close();
  await pubSub.close();
  clearInterval(timeout);
  redis.disconnect();
});

describe('prices: getCoinRankings', () => {
  beforeAll(async () => {
    const GET_API_KEY = `
      query {
        getAPIKey {
          timestamp
          key
        }
      }
    `;

    const result = await graphql(schema, GET_API_KEY, null, {
      token,
    });

    key = result.data?.getAPIKey.key;
  });

  it('should return ranking data', async () => {
    const GET_COIN_RANKINGS = `
    query {
      getCoinRankings {
        ranking
        coinID
        name
      }
    }
  `;

    const result = await graphql(schema, GET_COIN_RANKINGS, null, {
      key,
    });

    expect(result.data).toBeTruthy();
  });

  it('should limit data length when argument is passed in', async () => {
    const GET_COIN_RANKINGS = `
    query($limit: Int) {
      getCoinRankings(limit: $limit) {
        ranking
        coinID
        name
      }
    }
  `;
    const limit: number = 10;
    const result = await graphql(
      schema,
      GET_COIN_RANKINGS,
      null,
      {
        key,
      },
      {
        limit,
      }
    );

    expect(result.data).toBeTruthy();
    expect(result.data?.getCoinRankings.length).toBe(10);
  });
});

describe('prices: getPrices', () => {
  beforeAll(async () => {
    const GET_API_KEY = `
      query {
        getAPIKey {
          timestamp
          key
        }
      }
    `;

    const result = await graphql(schema, GET_API_KEY, null, {
      token,
    });

    key = result.data?.getAPIKey.key;
  });

  it('return market data for the given coinIDs', async () => {
    const GET_COIN_RANKINGS = `
    query($coinIDs: [String!]!) {
      getPrices(data:{coinIDs:$coinIDs}) {
        currentPrice
        name
      }
    }
  `;

    const coinIDs = ['btc', 'eth'];

    const result = await graphql(
      schema,
      GET_COIN_RANKINGS,
      null,
      {
        key,
      },
      {
        coinIDs,
      }
    );

    expect(result.data).toBeTruthy();
    expect(result.data?.getPrices[0].name).toBe('Bitcoin');
    expect(result.data?.getPrices[1].name).toBe('Ethereum');
  });
});

describe('prices: streamPrices', () => {
  beforeAll(async () => {
    const GET_API_KEY = `
    query {
      getAPIKey {
        timestamp
        key
      }
    }
  `;
    const result = await graphql(schema, GET_API_KEY, null, {
      token,
    });

    key = result.data?.getAPIKey.key;
    timeout = await startPricePublisher(pubSub, 15);
  });

  it('should subscribe to price stream publisher', async () => {
    const STREAM_PRICES = `
    subscription {
      streamPrices {
        coinID
        currentPrice
      }
    }`;

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
        {
          key,
        },
        { coinIDs }
      )) as AsyncIterableIterator<any>;

      const streamData = await (await result.next()).value.data.streamPrices;
      expect(streamData).toBeTruthy();
      expect(streamData).toHaveLength(2);
    }).not.toThrow();
  }, 20000);
});
