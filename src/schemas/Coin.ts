import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class Coin {
  @Field()
  @prop()
  id!: number;

  @Field()
  @prop()
  name!: string;

  @Field()
  @prop()
  symbol!: string;

  @Field()
  @prop()
  slug!: string;

  @Field()
  @prop()
  quantity!: number;
}
