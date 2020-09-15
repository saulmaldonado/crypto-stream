import { Express } from 'express';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import axios from 'axios';
import { PriceData } from '../subscriptions/prices';
import { pricePublishedInit } from './pricePublisherInit';

/**
 *
 * @param {Express} app  Express app instance
 * @param {number} [priceInterval=60] Interval at which prices will be published in seconds. Default: 60s
 */
export const pricePublish = (app: Express, priceInterval: number = 60) => {
  const pubSub = app.get('pubSub') as RedisPubSub;

  const fetchAndPublish = async (pubSub: RedisPubSub, coinID: string) => {
    const priceData = await axios.get<PriceData[]>(
      `https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API_KEY}&ids=${coinID}&interval=1d`
    );

    const payload = { currentPrice: Number(priceData.data[0].price), coinID };

    console.log(payload);

    pubSub.publish('PRICES', payload);
  };

  pricePublishedInit(() => {
    fetchAndPublish(pubSub, 'BTC');
  }, priceInterval);
};
