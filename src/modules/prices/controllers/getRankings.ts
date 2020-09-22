import { redis } from '../../../utils/redisCache';
import { CoinRanking } from '../../../schemas/CoinRanking';
import { PricePayload } from '../../../schemas/PricePayload';
import { fetchPrices } from './helpers/fetchCoinPrices';

export const getRankings = async (limit: number): Promise<CoinRanking[]> => {
  const res = await redis.get('rankings');
  let coins: PricePayload[] = [];

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
