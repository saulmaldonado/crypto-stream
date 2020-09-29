import { redis } from '../../../../utils/redisCache';
import { MarketData } from '../../../../schemas/MarketData';

export const getCoinsFromCache = async (coinIDs: string[]) => {
  const result = await redis.get('lastPrices');

  const coins: MarketData[] = [];

  if (result) {
    const cache: MarketData[] = JSON.parse(result);

    let index: number | null = null;

    const allMatched = coinIDs.every((id, i) => {
      const match = cache.find((coin) => coin.coinID === id.toUpperCase());
      if (match) {
        coins.push(match);
        return true;
      }
      index = i;
      return false;
    });

    const restOfCoinIds = !allMatched ? coinIDs.slice(index!) : null;
    return { ok: true, allMatched, coins, restOfCoinIds };
  }
  return { ok: false };
};
