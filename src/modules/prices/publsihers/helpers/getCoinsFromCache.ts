import { redis } from '../../../..';
import { PricePayload } from '../../../../schemas/PricePayload';

export const getCoinsFromCache = async (coinIDs: string[]) => {
  const result = await redis.get('lastPrices');

  const coins: PricePayload[] = [];

  if (result) {
    const cache: PricePayload[] = JSON.parse(result);

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

    const restOfCoinIds = index ? coinIDs.slice(index) : null;
    return { ok: true, allMatched, coins, restOfCoinIds };
  }
  return { ok: false };
};
