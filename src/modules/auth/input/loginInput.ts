import { Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { IsUsernameOrEmail } from './validators/IsUsernameOrEmail';
import { UsernameOrEmailExists } from './validators/UsernameOrEmailExists';

@InputType()
export class LoginInput {
  @Field()
  @IsUsernameOrEmail()
  @UsernameOrEmailExists()
  usernameOrEmail!: string;

  @Field()
  @Length(8, 255)
  password!: string;
}
