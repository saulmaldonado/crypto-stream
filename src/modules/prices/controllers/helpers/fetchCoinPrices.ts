import { ApolloError } from 'apollo-server-express';
import axios from 'axios';
import qs from 'qs';

import { PricePayload } from '../../prices';

type FetchPricesArguments = {
  coinIDs?: string[];
  limit?: number;
};

/**
 *
 * @param {coinID: Array<string>=[], limit: number=100} options for fetching market prices
 *
 * @returns {Array.<PricePayload>} Array of coin market data
 */
export const fetchPrices = async (
  { coinIDs = [], limit = 100 }: FetchPricesArguments = { coinIDs: [], limit: 100 }
): Promise<PricePayload[] | never> => {
  const coinIDsString = coinIDs.length
    ? `&${qs.stringify({ ids: coinIDs }, { arrayFormat: 'comma' })}`
    : '';
  if (coinIDsString) limit = coinIDs.length;

  try {
    console.time();
    const { data } = await axios.get<PriceData[]>(
      `https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API_KEY}${coinIDsString}&interval=1d`
    );
    console.timeEnd();

    data.length = limit;

    return data.map((coin) => {
      return {
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
      };
    });
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
