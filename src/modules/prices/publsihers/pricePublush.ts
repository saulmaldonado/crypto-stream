import { RedisPubSub } from 'graphql-redis-subscriptions';

import { pricePublishedInit } from './helpers/pricePublisherInit';
import { fetchPrices } from '../controllers/helpers/fetchCoinPrices';
import { allCoinIDs } from '../../../config/coinIDsConfig';

const fetchAndPublish = async (pubSub: RedisPubSub) => {
  // fetches the top 100 coins from coinIDsConfig file
  const coinIDs: string[] = allCoinIDs.slice(0, 100);

  const coins = await fetchPrices({ coinIDs });

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
