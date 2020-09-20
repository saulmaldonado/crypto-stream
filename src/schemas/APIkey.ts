import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class APIKey {
  @Field()
  @prop()
  public _id!: string;

  @Field()
  @prop()
  public userID!: string;

  @Field()
  @prop()
  public key!: string;
}
