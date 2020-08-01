import { Field, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';

import { Coin } from './Coin';
import { Transaction } from './Transaction';

@ObjectType()
export class User {
  @Field()
  id!: string;

  @Field()
  @prop()
  userID!: string;

  @Field()
  @prop()
  public username!: string;

  @Field(() => [Coin], { nullable: 'items' })
  @prop({ type: Coin })
  public portfolio?: Coin[];

  @Field(() => [Transaction], { nullable: 'items' })
  @prop({ type: Transaction })
  public tradingHistory?: Transaction[];
}
