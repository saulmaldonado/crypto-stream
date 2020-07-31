import { Resolver, Mutation, Arg, Query } from 'type-graphql';

import { registerUser } from './controllers/registerController';
import { User } from '../../schemas/Users';
import { RegisterInput } from './input/registerInput';

@Resolver()
export class RegisterResolver {
  @Query(() => String)
  hello() {
    return 'hello';
  }

  @Mutation(() => User)
  async register(@Arg('data') { email, password, username }: RegisterInput): Promise<User | never> {
    const user = await registerUser({ email, password, username });
    return user;
  }
}
