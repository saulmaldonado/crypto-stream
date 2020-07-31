import { Field, InputType } from 'type-graphql';
import { IsUserID } from './validators/IsUserID';

@InputType()
export class VerifyEmailInput {
  @Field()
  @IsUserID()
  userID!: string;
}
