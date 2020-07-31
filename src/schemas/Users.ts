import { Field, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';

@ObjectType()
export class User {
  @Field()
  id!: string;

  @Field()
  @prop({ required: true })
  public username!: string;

  @Field()
  @prop({ required: true })
  public email!: string;

  @Field()
  @prop()
  public emailVerified!: boolean;
}
