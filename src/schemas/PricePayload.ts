import { ObjectType, Field } from 'type-graphql';

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
