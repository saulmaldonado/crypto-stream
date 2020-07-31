import { Resolver, Mutation, Arg, Query } from 'type-graphql';
import { UserAuth } from '../../schemas/UsersAuth';
import { registerUser } from '../auth/controllers/registerController';
import { RegisterInput } from '../auth/input/registerInput';

@Resolver()
export class RegisterResolver {
  @Query(() => UserAuth)
  hello() {
    return 'hello';
  }

  @Mutation(() => UserAuth)
  async register(
    @Arg('data') { email, password, username }: RegisterInput
  ): Promise<UserAuth | never> {
    const user = await registerUser({ email, password, username });
    return user;
  }
}
