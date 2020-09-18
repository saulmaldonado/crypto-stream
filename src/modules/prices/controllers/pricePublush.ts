import { Express } from 'express';
import { RedisPubSub } from 'graphql-redis-subscriptions';

import { pricePublishedInit } from './helpers/pricePublisherInit';
import { fetchPrices } from './helpers/fetchCoinPrices';
/**
 *
 * @param {Express} app  Express app instance
 * @param {number} [priceInterval=60] Interval at which prices will be published in seconds. Default: 60s
 */
export const pricePublish = async (app: Express, priceInterval: number = 60) => {
  const pubSub = app.get('pubSub') as RedisPubSub;

  const fetchAndPublish = async (pubSub: RedisPubSub, coinIDs: string[]) => {
    const coins = await fetchPrices();

    console.log(coins);

    pubSub.publish('PRICES', coins);
  };

  let rankings: string[] = [];

  pricePublishedInit(() => {
    fetchAndPublish(pubSub, rankings);
  }, priceInterval);
};
