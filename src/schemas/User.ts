import { Field, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';
import { Coin } from './Coin';

@ObjectType()
export class User {
  @Field()
  id!: string;

  @Field()
  @prop()
  public username!: string;

  @Field()
  @prop()
  public portfolio!: Coin[];

  @Field()
  @prop()
  public tradingHistory!: any;
}
