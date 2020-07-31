import { IsJWT } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
export class LoginTokens {
  @Field()
  @IsJWT()
  public access_token!: string;

  @Field()
  @IsJWT()
  public id_token?: string;

  @Field()
  @IsJWT()
  public refresh_token?: string;
}
