import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Transaction {
  @Field()
  id!: number;

  @Field()
  @prop()
  buyOrSell!: 'buy' | 'sell';

  @Field()
  @prop()
  coinName!: string;

  @Field()
  @prop()
  coinID!: number;

  @Field()
  @prop()
  coinSymbol!: string;

  @Field()
  @prop()
  quantity!: number;

  @Field()
  @prop()
  date!: Date;
}
