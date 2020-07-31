import { IsJWT } from 'class-validator';
import { Field, ObjectType } from 'type-graphql';
import { IsUserID } from '../modules/auth/input/validators/IsUserID';

@ObjectType()
export class LoginTokensAndID {
  @Field()
  @IsJWT()
  public access_token!: string;

  @Field()
  @IsJWT()
  public id_token!: string;

  @Field()
  @IsJWT()
  public refresh_token?: string;

  @Field()
  @IsUserID()
  public userID!: string;
}
