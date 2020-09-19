import { Express } from 'express';
import { RedisPubSub } from 'graphql-redis-subscriptions';

import { pricePublishedInit } from './helpers/pricePublisherInit';
import { fetchPrices } from '../controllers/helpers/fetchCoinPrices';
import { allCoinIDs } from '../../../config/coinIDsConfig';

const fetchAndPublish = async (pubSub: RedisPubSub, coinIDs: string[]) => {
  const coins = await fetchPrices({ coinIDs });

  pubSub.publish('PRICES', coins);
};

/**
 *
 * @param {Express} app  Express app instance
 * @param {number} [priceInterval=60] Interval at which prices will be published in seconds. Default: 60s
 */
export const pricePublish = async (app: Express, priceInterval: number = 60) => {
  const pubSub = app.get('pubSub') as RedisPubSub;

  // fetches the top 100 coins from coinIDsConfig file
  let coinIDs: string[] = allCoinIDs.slice(0, 100);

  pricePublishedInit(() => {
    fetchAndPublish(pubSub, coinIDs);
  }, priceInterval);
};
