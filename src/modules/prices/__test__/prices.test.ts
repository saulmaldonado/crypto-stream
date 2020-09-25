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
import { PricePayload } from '../../../schemas/PricePayload';

let token: string;
let key: string;
let schema: GraphQLSchema;
let timeout: NodeJS.Timeout;
let anonRateLimit: number = 100;

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
}
`;

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

    expect(true).toBeTruthy();
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
});
