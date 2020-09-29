import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType('Transaction')
export class Transaction {
  @Field()
  id!: string;

  @Field()
  @prop()
  buyOrSell!: 'buy' | 'sell';

  @Field()
  @prop()
  coinName!: string;

  @Field()
  @prop()
  coinID!: string;

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
