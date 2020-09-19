import { PricePayload } from '../../../schemas/PricePayload';
import { getCoinsFromCache } from '../publsihers/helpers/getCoinsFromCache';
import { fetchPrices } from './helpers/fetchCoinPrices';

export const getCoinPrices = async (coinIDs: string[]) => {
  let { ok, allMatched, coins, restOfCoinIds } = await getCoinsFromCache(coinIDs);

  if (ok) {
    if (!allMatched) {
      const restOfCoins: PricePayload[] = await fetchPrices({ coinIDs: restOfCoinIds! });
      coins = coins!.concat(restOfCoins);
    }
    return coins!;
  }

  return await fetchPrices({ coinIDs });
};
