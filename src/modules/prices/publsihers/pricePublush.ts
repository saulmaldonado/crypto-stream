import { RedisPubSub } from 'graphql-redis-subscriptions';

import { pricePublishedInit } from './helpers/pricePublisherInit';
import { fetchPrices } from '../controllers/helpers/fetchCoinPrices';
import { redis } from '../../../utils/redisCache';
import { CurrencyRanking } from '../../../schemas/CurrencyRanking';
import { MarketData } from '../../../schemas/MarketData';

export const fetchAndPublish = async (pubSub: RedisPubSub) => {
  // fetch the coin rankings from cache (rankings have 10min expiry)
  const res = await redis.get('rankings');
  let coins: MarketData[] = [];

  if (!res) {
    /** if cache is empty, fetch all prices and filter to the top 100.
    This will also set ranking cache again */
    coins = await fetchPrices({ limit: 100, subscription: true });
  } else {
    // map the cache to coinIDs array and fetch the coins
    const rankings: CurrencyRanking[] = JSON.parse(res);
    const coinIDs: string[] = rankings.slice(0, 100).map((coin) => coin.coinID);
    coins = await fetchPrices({ coinIDs, subscription: true });
  }

  pubSub.publish('PRICES', coins);
};

type StartPricePublisher = (pubSub: RedisPubSub, priceInterval?: number) => NodeJS.Timeout;
/**
 *
 * @param {pubSub} RedisPubSub  Redis PubSub instance
 * @param {number} [priceInterval=60] Interval at which prices will be published in seconds.
 * @returns {NodeJS.Timeout} NodeJS.Timeout
 */
export const startPricePublisher: StartPricePublisher = (pubSub, priceInterval = 60) => {
  return pricePublishedInit(() => {
    fetchAndPublish(pubSub);
  }, priceInterval);
};
