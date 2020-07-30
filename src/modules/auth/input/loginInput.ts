import { Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';
import { IsUsernameOrEmail } from './IsUsernameOrEmail';

@InputType()
export class LoginInput {
  @Field()
  @IsUsernameOrEmail()
  usernameOrEmail!: string;

  @Field()
  @Length(8, 255)
  password!: string;
}
