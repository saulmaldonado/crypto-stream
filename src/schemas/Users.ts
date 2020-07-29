import { Field, ID, ObjectType } from 'type-graphql';
import { prop } from '@typegoose/typegoose';

@ObjectType()
export class User {
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
// export const UserSchema: Schema = new Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       // unique: true,
//     },
//     password: {
//       type: String,
//       required: true,
//       // unique: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       // unique: true,
//     },
//   },
//   { collection: 'auth' }
// );
