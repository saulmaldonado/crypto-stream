import { Arg, Mutation, Query, Resolver } from 'type-graphql';

import { LoginTokens } from '../../schemas/Tokens';
import { loginUser } from './controllers/loginController';
import { LoginInput } from './input/loginInput';

@Resolver()
export class LoginResolver {
  @Query(() => Boolean)
  hello() {
    return true;
  }

  @Mutation(() => LoginTokens)
  async login(
    @Arg('data') { usernameOrEmail, password }: LoginInput
  ): Promise<LoginTokens | never> {
    const tokens = await loginUser({ usernameOrEmail, password });

    return tokens;
  }
}
