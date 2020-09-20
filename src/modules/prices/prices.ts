import { Arg, Query, Resolver, Root, Subscription, UseMiddleware } from 'type-graphql';
import { CoinRanking } from '../../schemas/CoinRanking';
import { PricePayload } from '../../schemas/PricePayload';
import { checkAPIKey } from '../apiKey/middlware/checkAPIKey';
import { rateLimitAll, rateLimitAnon } from '../auth/middleware/rateLimit';
import { getCoinPrices } from './controllers/getCoinPrices';
import { getRankings } from './controllers/getRankings';
import { getPriceInput } from './input/coinIDs';

@Resolver()
export class PriceResolver {
  @Subscription(() => [PricePayload], {
    topics: 'PRICES',
  })
  @UseMiddleware(rateLimitAnon(100))
  async requestPrices(@Root() pricePayload: PricePayload): Promise<PricePayload | never> {
    return pricePayload;
  }

  @Query(() => [PricePayload], { nullable: 'items' })
  @UseMiddleware(rateLimitAll(100))
  async getPrices(@Arg('data') { coinIDs }: getPriceInput): Promise<PricePayload[] | never> {
    return getCoinPrices(coinIDs);
  }

  @Query(() => [CoinRanking], { nullable: 'items' })
  @UseMiddleware(rateLimitAnon(100))
  @UseMiddleware(checkAPIKey())
  async getCoinRankings(
    @Arg('limit', { defaultValue: 100 }) limit: number
  ): Promise<CoinRanking[] | never> {
    return getRankings(limit);
  }
}
