import { RedisPubSub } from 'graphql-redis-subscriptions';

import { pricePublishedInit } from './helpers/pricePublisherInit';
import { fetchPrices } from '../controllers/helpers/fetchCoinPrices';
import { redis } from '../../../utils/redisCache';
import { CoinRanking } from '../../../schemas/CoinRanking';
import { PricePayload } from '../../../schemas/PricePayload';

const fetchAndPublish = async (pubSub: RedisPubSub) => {
  // fetch the coin rankings from cache (rankings have 10min expiry)
  const res = await redis.get('rankings');
  let coins: PricePayload[] = [];

  if (!res) {
    /** if cache is empty, fetch all prices and filter to the top 100.
    This will also set ranking cache again */
    coins = await fetchPrices({ limit: 100, subscription: true });
  } else {
    // map the cache to coinIDs array and fetch the coins
    const rankings: CoinRanking[] = JSON.parse(res);
    const coinIDs: string[] = rankings.slice(0, 100).map((coin) => coin.coinID);
    coins = await fetchPrices({ coinIDs, subscription: true });
  }

  pubSub.publish('PRICES', coins);
};

/**
 *
 * @param {Express} app  Express app instance
 * @param {number} [priceInterval=60] Interval at which prices will be published in seconds.
 */
export const startPricePublisher = async (pubSub: RedisPubSub, priceInterval: number = 60) => {
  pricePublishedInit(() => {
    fetchAndPublish(pubSub);
  }, priceInterval);
};
