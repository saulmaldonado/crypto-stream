import { Arg, Int, Query, Resolver, Root, Subscription, UseMiddleware } from 'type-graphql';
import { CurrencyRanking } from '../../schemas/CurrencyRanking';
import { MarketData } from '../../schemas/MarketData';
import { checkAPIKey } from '../apiKey/middleware/checkAPIKey';
import { rateLimitAnon } from '../auth/middleware/rateLimitAnon';
import { rateLimitAll } from '../auth/middleware/rateLimitAll';
import { getCoinPrices } from './controllers/getCoinPrices';
import { getRankings } from './controllers/getRankings';
import { CurrencyIDInput } from './input/currencyIDs';
import { rateLimiters } from '../../config/RateLimitConfig';
import metadata from './prices.metadata.json';

@Resolver()
export class PriceResolver {
  @Subscription(() => [MarketData], {
    topics: 'PRICES',
    description: metadata.streamPrices.description,
  })
  @UseMiddleware(rateLimitAnon(rateLimiters.streamPrices.UNAUTHENTICATED))
  streamPrices(
    @Root() marketData: MarketData[],
    @Arg('data', { nullable: true }) input: CurrencyIDInput
  ): MarketData[] {
    if (input?.coinIDs && input.coinIDs.length) {
      return marketData.filter((coin) => input.coinIDs.includes(coin.coinID));
    }
    return marketData;
  }

  @Query(() => [MarketData], {
    nullable: 'items',
    description: metadata.getPrices.description,
  })
  @UseMiddleware(
    rateLimitAll(rateLimiters.getPrices.AUTHENTICATED, rateLimiters.getPrices.UNAUTHENTICATED)
  )
  async getPrices(@Arg('data') { coinIDs }: CurrencyIDInput): Promise<MarketData[] | never> {
    return getCoinPrices(coinIDs);
  }

  @Query(() => [CurrencyRanking], {
    nullable: 'items',
    description: metadata.getCurrencyRankings.description,
  })
  @UseMiddleware(rateLimitAnon(rateLimiters.getCurrencyRankings.UNAUTHENTICATED))
  @UseMiddleware(checkAPIKey())
  async getCurrencyRankings(
    @Arg('limit', () => Int, { defaultValue: 100, description: metadata.limit.description })
    limit: number
  ): Promise<CurrencyRanking[] | never> {
    return getRankings(limit);
  }
}
