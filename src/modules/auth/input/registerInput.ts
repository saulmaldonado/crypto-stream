import { IsEmail, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { EmailIsUnique } from './validators/EmailIsUnique';
import { UsernameIsUnique } from './validators/UsernameIsUnique';

@InputType()
export class RegisterInput {
  @Field()
  @Length(5, 50)
  @UsernameIsUnique()
  username!: string;

  @Field()
  @IsEmail()
  @EmailIsUnique()
  email!: string;

  @Field()
  @Length(8, 255)
  password!: string;
}
