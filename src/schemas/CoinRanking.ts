import { ObjectType, Field } from 'type-graphql';

@ObjectType()
export class CoinRanking {
  @Field()
  ranking!: number;

  @Field()
  coinID!: string;

  @Field()
  name!: string;
}
