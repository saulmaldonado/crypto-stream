import { Express } from 'express';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import axios from 'axios';
import { stringify } from 'qs';

import { pricePublishedInit } from './helpers/pricePublisherInit';
import { ApolloError } from 'apollo-server-express';
import { PricePayload } from '../prices';
/**
 *
 * @param {Express} app  Express app instance
 * @param {number} [priceInterval=60] Interval at which prices will be published in seconds. Default: 60s
 */
export const pricePublish = (app: Express, priceInterval: number = 60) => {
  const pubSub = app.get('pubSub') as RedisPubSub;

  const fetchAndPublish = async (pubSub: RedisPubSub, coinID: string) => {
    const coins = await fetchPrices([coinID]);
    pubSub.publish('PRICES', coins);
  };

  pricePublishedInit(() => {
    fetchAndPublish(pubSub, 'BTC');
  }, priceInterval);
};

export const fetchPrices = async (coinIDs: string[]): Promise<PricePayload[] | never> => {
  coinIDs.forEach((coin, i, arr) => {
    arr[i] = arr[i].toUpperCase();
  });
  const coinIDString = stringify({ ids: coinIDs }, { arrayFormat: 'comma' });

  try {
    const { data } = await axios.get<PriceData[]>(
      `https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API_KEY}&${coinIDString}&interval=1d`
    );

    const coins = data.map((coin) => ({
      currentPrice: Number(coin.price),
      name: coin.name,
      coinID: coin.id,
      priceTimestamp: new Date(coin.price_timestamp),
      circulatingSupply: Number(coin.circulating_supply),
      maxSupply: Number(coin.max_supply),
      marketCap: Number(coin.market_cap),
      oneDayPriceChange: Number(coin['1d'].price_change),
      oneDayPriceChangePct: Number(coin['1d'].price_change_pct),
      oneDayVolume: Number(coin['1d'].volume),
    }));

    console.log(coins);

    return coins;
  } catch (error) {
    throw new ApolloError(error, 'EXTERNAL_API_ERROR');
  }
};

export type PriceData = {
  id: string;
  currency: string;
  symbol: string;
  name: string;
  logo_url: string;
  price: string;
  price_date: string;
  price_timestamp: string;
  max_supply: string;
  circulating_supply: string;
  market_cap: string;
  rank: string;
  high: string;
  high_timestamp: string;
  '1d': {
    volume: string;
    price_change: string;
    price_change_pct: string;
    volume_change: string;
    volume_change_pct: string;
    market_cap_change: string;
    market_cap_change_pct: string;
  };
};
