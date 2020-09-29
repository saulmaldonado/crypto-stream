import { ObjectType, Field } from 'type-graphql';
import metadata from './schemas.metadata.json';

@ObjectType('CurrencyRanking', { description: metadata.CurrencyRanking.description })
export class CurrencyRanking {
  @Field()
  ranking!: number;

  @Field()
  coinID!: string;

  @Field()
  name!: string;
}
