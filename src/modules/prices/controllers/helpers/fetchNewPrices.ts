import axios from 'axios';
import { ApolloError } from 'apollo-server-express';
import { config } from 'dotenv';
import { stringify } from 'qs';
import { PriceData } from './fetchCoinPrices';

config();

type FetchNewPrices = (coinIDs?: string[]) => Promise<PriceData[] | never>;

/**
 * Fetches new prices from external API
 * @param {string[]} [coinIds=[]] - An array of coinIds
 */
export const fetchNewPrices: FetchNewPrices = async (coinIDs = []) => {
  const coinIDsString = coinIDs.length
    ? `&${stringify({ ids: coinIDs }, { arrayFormat: 'comma' })}`
    : '';
  try {
    const { data } = await axios.get<PriceData[]>(
      `https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API_KEY}${coinIDsString}&interval=1d`
    );
    return data;
  } catch (error) {
    throw new ApolloError(error, 'EXTERNAL_API_ERROR');
  }
};
