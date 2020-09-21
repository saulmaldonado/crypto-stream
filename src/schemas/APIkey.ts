/* eslint-disable max-classes-per-file */
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

  @prop({ index: true })
  public userID!: string;

  @prop()
  public timestamp!: Date;

  @prop()
  public encryptedKey!: string;

  @prop()
  public iv!: string;
}
