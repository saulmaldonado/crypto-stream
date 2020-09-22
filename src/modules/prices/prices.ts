import { Arg, Int, Query, Resolver, Root, Subscription, UseMiddleware } from 'type-graphql';
import { CoinRanking } from '../../schemas/CoinRanking';
import { PricePayload } from '../../schemas/PricePayload';
import { checkAPIKey } from '../apiKey/middleware/checkAPIKey';
import { rateLimitAll, rateLimitAnon } from '../auth/middleware/rateLimit';
import { getCoinPrices } from './controllers/getCoinPrices';
import { getRankings } from './controllers/getRankings';
import { CoinIDInput } from './input/coinIDs';

@Resolver()
export class PriceResolver {
  @Subscription(() => [PricePayload], {
    topics: 'PRICES',
  })
  @UseMiddleware(rateLimitAnon(100))
  async streamPrices(
    @Root() pricePayload: PricePayload[],
    @Arg('data', { nullable: true }) input: CoinIDInput
  ): Promise<PricePayload[] | never> {
    if (input?.coinIDs && input?.coinIDs.length) {
      return pricePayload.filter((coin) => input.coinIDs.includes(coin.coinID));
    }
    return pricePayload;
  }

  @Query(() => [PricePayload], { nullable: 'items' })
  @UseMiddleware(rateLimitAll(100))
  async getPrices(@Arg('data') { coinIDs }: CoinIDInput): Promise<PricePayload[] | never> {
    return getCoinPrices(coinIDs);
  }

  @Query(() => [CoinRanking], { nullable: 'items' })
  @UseMiddleware(rateLimitAnon(100))
  @UseMiddleware(checkAPIKey())
  async getCoinRankings(
    @Arg('limit', () => Int, { defaultValue: 100 }) limit: number
  ): Promise<CoinRanking[] | never> {
    return getRankings(limit);
  }
}
