import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class APIKey {
  @Field()
  public timestamp!: Date;

  @Field()
  public key!: string;
}

export class APIKeyModel {
  @prop()
  public _id!: string;

  @prop()
  public userID!: string;

  @prop()
  public timestamp!: Date;

  @prop()
  public hashedKey!: string;
}
