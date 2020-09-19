import {
  Arg,
  Field,
  ObjectType,
  Query,
  Resolver,
  Root,
  Subscription,
  UseMiddleware,
} from 'type-graphql';
import { rateLimitAll, rateLimitAnon } from '../auth/middleware/rateLimit';
import { getCoinPrices } from './controllers/getCoinPrices';
import { getRankings } from './controllers/getRankings';
import { getPriceInput } from './input/coinIDs';

@ObjectType()
export class PricePayload {
  @Field()
  currentPrice!: number;

  @Field()
  name!: string;

  @Field()
  coinID!: string;

  @Field()
  priceTimestamp!: string;

  @Field()
  circulatingSupply!: number;

  @Field()
  maxSupply!: number;

  @Field()
  marketCap!: number;

  @Field()
  oneDayPriceChange!: number;

  @Field()
  oneDayPriceChangePct!: number;

  @Field()
  oneDayVolume!: number;
}

@ObjectType()
export class CoinRanking {
  @Field()
  ranking!: number;

  @Field()
  coinID!: string;

  @Field()
  name!: string;
}

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
  @UseMiddleware(rateLimitAll(50))
  async getPrices(@Arg('data') { coinIDs }: getPriceInput): Promise<PricePayload[] | never> {
    return await getCoinPrices(coinIDs);
  }

  @Query(() => [CoinRanking], { nullable: 'items' })
  @UseMiddleware(rateLimitAnon(100))
  async getCoinRankings(
    @Arg('limit', { defaultValue: 100 }) limit: number
  ): Promise<CoinRanking[] | never> {
    return await getRankings(limit);
  }
}
