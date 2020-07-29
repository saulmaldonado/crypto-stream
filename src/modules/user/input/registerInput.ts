import { IsEmail, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';

import { EmailIsUnique } from './EmailIsUnique';

@InputType()
export class RegisterInput {
  @Field()
  @Length(5, 50)
  username!: string;

  @Field()
  @IsEmail()
  @EmailIsUnique({ message: 'Email already exists' })
  email!: string;

  @Field()
  @Length(8, 255)
  password!: string;
}
