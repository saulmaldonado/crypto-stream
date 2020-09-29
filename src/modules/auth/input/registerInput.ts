import { IsEmail, Length } from 'class-validator';
import { Field, InputType } from 'type-graphql';

@InputType('RegisterInput')
export class RegisterInput {
  @Field()
  @Length(5, 50)
  username!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @Length(8, 255)
  password!: string;
}
