import { Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { IsUsernameOrEmail } from './validators/IsUsernameOrEmail';

@InputType('LoginInput')
export class LoginInput {
  @Field()
  @IsUsernameOrEmail()
  usernameOrEmail!: string;

  @Field()
  @Length(8, 255)
  password!: string;
}
