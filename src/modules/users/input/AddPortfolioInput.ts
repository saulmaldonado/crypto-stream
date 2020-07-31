import { Length } from 'class-validator';
import { InputType, Field } from 'type-graphql';
import { IsUserID } from '../../auth/input/validators/IsUserID';
import { IsUsernameOrEmail } from '../../auth/input/validators/IsUsernameOrEmail';
import { UsernameIsUnique } from '../../auth/input/validators/UsernameIsUnique';

@InputType()
export class AddPortfolioInput {
  @Field()
  @IsUsernameOrEmail()
  @UsernameIsUnique()
  username!: string;

  @Field()
  @IsUserID()
  userID!: string;
}
