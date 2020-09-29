import { ObjectType, Field } from 'type-graphql';
import metadata from './schemas.metadata.json';

@ObjectType('MarketData', { description: metadata.MarketData.description })
export class MarketData {
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
