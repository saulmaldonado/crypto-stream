import { CoinRanking } from '../prices';
import { fetchPrices } from './helpers/fetchCoinPrices';

export const getRankings = async (limit: number): Promise<CoinRanking[]> => {
  const coins = await fetchPrices({ limit });

  return coins.map(({ coinID, name }, index) => ({
    ranking: index + 1,
    coinID,
    name,
  }));
};
