import { RedisPubSub } from 'graphql-redis-subscriptions';

import { pricePublishedInit } from './helpers/pricePublisherInit';
import { fetchPrices } from '../controllers/helpers/fetchCoinPrices';
import { redis } from '../../..';
import { CoinRanking, PricePayload } from '../prices';

const fetchAndPublish = async (pubSub: RedisPubSub) => {
  // fetch the coin rankings from cache (rankings have 10 expiry)
  const res = await redis.get('rankings');
  let coins: PricePayload[] = [];

  if (!res) {
    // if cache is empty, fetch all prices and filter to the top 100. This will also set ranking cache again
    coins = await fetchPrices({ limit: 100 });
  } else {
    // map the cache to coinIDs array and fetch the coins
    let rankings: CoinRanking[] = JSON.parse(res);
    const coinIDs: string[] = rankings.slice(0, 100).map((coin) => coin.name);
    coins = await fetchPrices({ coinIDs });
  }

  pubSub.publish('PRICES', coins);
};

/**
 *
 * @param {Express} app  Express app instance
 * @param {number} [priceInterval=60] Interval at which prices will be published in seconds. Default: 60s
 */
export const startPricePublisher = async (pubSub: RedisPubSub, priceInterval: number = 60) => {
  pricePublishedInit(() => {
    fetchAndPublish(pubSub);
  }, priceInterval);
};