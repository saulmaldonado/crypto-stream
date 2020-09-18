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
import { fetchPrices } from './controllers/pricePublush';
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
  priceTimestamp!: Date;

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

@Resolver()
export class PriceResolver {
  @Subscription(() => [PricePayload], {
    topics: 'PRICES',
  })
  @UseMiddleware(rateLimitAnon(100))
  async requestPrices(@Root() pricePayload: PricePayload): Promise<PricePayload | never> {
    return pricePayload;
  }

  @Query(() => [PricePayload])
  @UseMiddleware(rateLimitAll(50))
  async getPrices(@Arg('data') { coinIDs }: getPriceInput): Promise<PricePayload[] | never> {
    return await fetchPrices(coinIDs);
  }
}
