import { Arg, Mutation, Resolver } from 'type-graphql';

import { verifyEmail } from './controllers/verifyEmailController';
import { VerifyEmailInput } from './input/verifyEmailInput';

@Resolver()
export class EmailResolver {
  @Mutation(() => Boolean)
  async sendEmailVerification(@Arg('data') { userID }: VerifyEmailInput): Promise<true | never> {
    await verifyEmail(userID);
    return true;
  }
}
