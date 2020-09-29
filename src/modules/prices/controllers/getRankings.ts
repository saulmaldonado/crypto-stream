import { redis } from '../../../utils/redisCache';
import { CurrencyRanking } from '../../../schemas/CurrencyRanking';
import { MarketData } from '../../../schemas/MarketData';
import { fetchPrices } from './helpers/fetchCoinPrices';

export const getRankings = async (limit: number): Promise<CurrencyRanking[]> => {
  const res = await redis.get('rankings');
  let coins: MarketData[] = [];

  if (!res) {
    coins = await fetchPrices({ limit });
  } else {
    coins = JSON.parse(res);
    coins.length = limit;
  }

  return coins.map(({ coinID, name }, index) => ({
    ranking: index + 1,
    coinID,
    name,
  }));
};
