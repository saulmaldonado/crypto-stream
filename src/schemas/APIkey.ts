/* eslint-disable max-classes-per-file */
import { prop } from '@typegoose/typegoose';
import { Field, ObjectType } from 'type-graphql';
import metadata from './schemas.metadata.json';

@ObjectType('APIKey', { description: metadata.APIKey.description })
export class APIKey {
  @Field()
  public timestamp!: Date;

  @Field()
  public key!: string;
}

export class APIKeyModel {
  @prop()
  public _id!: string;

  @prop({ unique: true })
  public userID!: string;

  @prop()
  public timestamp!: Date;

  @prop()
  public encryptedKey!: string;

  @prop()
  public iv!: string;
}
