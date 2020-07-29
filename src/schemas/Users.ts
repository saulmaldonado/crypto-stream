import { Field, ID, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';
import { ObjectID } from 'mongodb';

@ObjectType()
export class User {
  @Field(() => ID)
  id?: ObjectID;

  @Field()
  @prop({ required: true })
  public username!: string;

  @Field()
  @prop({ required: true })
  public password!: string;

  @Field()
  @prop({ required: true })
  public email!: string;
}
