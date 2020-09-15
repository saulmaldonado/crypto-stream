import axios from 'axios';
import { Arg, Field, ObjectType, Query, Resolver, Root, Subscription } from 'type-graphql';

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
  requestPrices(@Root() pricePayload: PricePayload): PricePayload {
    return pricePayload;
  }

  @Query(() => Boolean)
  async getPrices(@Arg('coinID') coinID: string) {
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
