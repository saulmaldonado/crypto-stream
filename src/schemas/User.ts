import { Field, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';
import { Coin } from './Coin';
import { Transaction } from './Transaction';

@ObjectType()
export class User {
  @Field()
  id!: string;

  @Field()
  userID!: string;

  @Field()
  @prop()
  public username!: string;

  @Field()
  @prop()
  public portfolio?: Coin[];

  @Field()
  @prop()
  public tradingHistory?: Transaction[];
}
