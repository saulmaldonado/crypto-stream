import { Resolver, Mutation, Arg, Query } from 'type-graphql';

import { registerUser } from './controllers/registerController';
import { UserAuth } from '../../schemas/UsersAuth';
import { RegisterInput } from './input/registerInput';

@Resolver()
export class RegisterResolver {
  @Mutation(() => UserAuth)
  async register(
    @Arg('data') { email, password, username }: RegisterInput
  ): Promise<UserAuth | never> {
    const user = await registerUser({ email, password, username });
    return user;
  }
}
