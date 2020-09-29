/* eslint-disable no-console */
/* eslint-disable camelcase */
import { ApolloError } from 'apollo-server-express';
import axios from 'axios';
import qs from 'qs';

import { redis } from '../../../../utils/redisCache';
import { MarketData } from '../../../../schemas/MarketData';

type FetchPricesArguments = {
  coinIDs?: string[];
  limit?: number;
  subscription?: boolean;
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

const ONE_MINUTE = 60;
const ONE_HOUR = 60 * 60;
/**
 *
 * @param {coinID: Array<string>=[], limit: number=100} options for fetching market prices
 *
 * @returns {Array.<MarketData>} Array of coin market data
 */
export const fetchPrices = async (
  { coinIDs = [], limit = 100, subscription = false }: FetchPricesArguments = {
    coinIDs: [],
    limit: 100,
  }
): Promise<MarketData[] | never> => {
  const coinIDsString = coinIDs.length
    ? `&${qs.stringify({ ids: coinIDs }, { arrayFormat: 'comma' })}`
    : '';

  try {
    const { data } = await axios.get<PriceData[]>(
      `https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API_KEY}${coinIDsString}&interval=1d`
    );

    if (coinIDsString) {
      limit = coinIDs.length;
    } else {
      redis
        .set(
          'rankings',
          JSON.stringify(
            data.slice(0, 100).map(({ id: coinID, name }, index) => ({
              ranking: index + 1,
              coinID,
              name,
            }))
          ),
          'ex',
          ONE_MINUTE * 10
        )
        .catch();
    }

    data.length = limit;

    const mappedData: MarketData[] = data.map((coin) => ({
      currentPrice: Number(coin.price),
      name: coin.name,
      coinID: coin.id,
      priceTimestamp: coin.price_timestamp,
      circulatingSupply: Number(coin.circulating_supply),
      maxSupply: Number(coin.max_supply),
      marketCap: Number(coin.market_cap),
      oneDayPriceChange: Number(coin['1d']?.price_change ?? 0),
      oneDayPriceChangePct: Number(coin['1d']?.price_change_pct ?? 0),
      oneDayVolume: Number(coin['1d']?.volume ?? 0),
    }));

    // if called for subscription, set subscription cache
    if (subscription) redis.set('lastPrices', JSON.stringify(mappedData), 'ex', ONE_HOUR);

    return mappedData;
  } catch (error) {
    throw new ApolloError(error, 'EXTERNAL_API_ERROR');
  }
};
