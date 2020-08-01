import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Coin {
  @Field()
  @prop()
  id!: string;

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
}
