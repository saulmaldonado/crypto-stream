import { Length } from 'class-validator';
import { InputType, Field } from 'type-graphql';
import { IsUserID } from '../../auth/input/validators/IsUserID';
import { IsUsernameOrEmail } from '../../auth/input/validators/IsUsernameOrEmail';
import { UsernameOrEmailExists } from '../../auth/input/validators/UsernameOrEmailExists';

@InputType()
export class AddPortfolioInput {
  @Field()
  @IsUsernameOrEmail()
  @UsernameOrEmailExists()
  username!: string;

  @Field()
  @IsUserID()
  userID!: string;
}
