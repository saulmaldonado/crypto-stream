import { Field, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';

import { Coin } from './Coin';
import { Transaction } from './Transaction';

@ObjectType()
export class Portfolio {
  @Field()
  public id!: string;

  @Field()
  @prop()
  public userID!: string;

  @Field()
  @prop()
  public username!: string;

  @Field(() => [Coin], { nullable: 'items' })
  @prop({ type: Coin, _id: false })
  public portfolio?: Coin[];

  @Field(() => [Transaction], { nullable: 'items' })
  @prop({ type: Transaction })
  public tradingHistory?: Transaction[];
}
