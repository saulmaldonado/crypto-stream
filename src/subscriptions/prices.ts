import axios from 'axios';
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
import { rateLimitAll, rateLimitAnon } from '../modules/auth/middleware/rateLimit';

@ObjectType()
export class PricePayload {
  @Field()
  currentPrice!: number;

  @Field()
  coinID!: string;
}

@Resolver()
export class PriceResolver {
  @Subscription(() => PricePayload, {
    topics: 'PRICES',
  })
  @UseMiddleware(rateLimitAnon(100))
  async requestPrices(@Root() pricePayload: PricePayload): Promise<PricePayload | never> {
    return pricePayload;
  }

  @Query(() => PricePayload)
  @UseMiddleware(rateLimitAll(50))
  async fetchPrices(@Arg('coinID') coinID: string) {
    const priceData = await axios.get<PriceData[]>(
      `https://api.nomics.com/v1/currencies/ticker?key=${process.env.NOMICS_API_KEY}&ids=${coinID}&interval=1d`
    );

    return { currentPrice: Number(priceData.data[0].price), coinID };
  }
}

export type PriceData = {
  id: string;
  currency: string;
  symbol: string;
  name: string;
  logo_url: string;
  price: string;
  price_date: string;
  price_timestamp: string;
  circulating_supply: string;
  market_cap: string;
  rank: string;
  high: string;
  high_timestamp: string;
  '1d': {
    volume: string;
    price_change: string;
    price_change_pct: string;
    volume_change: string;
    volume_change_pct: string;
    market_cap_change: string;
    market_cap_change_pct: string;
  };
};
