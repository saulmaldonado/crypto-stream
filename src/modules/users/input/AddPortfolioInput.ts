import { InputType, Field } from 'type-graphql';
import { IsUserID } from '../../auth/input/validators/IsUserID';
import { IsUsernameOrEmail } from '../../auth/input/validators/IsUsernameOrEmail';

@InputType()
export class AddPortfolioInput {
  @Field()
  @IsUsernameOrEmail()
  username!: string;

  @Field()
  @IsUserID()
  userID!: string;
}
