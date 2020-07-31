import { Arg, Mutation, Query, Resolver } from 'type-graphql';

import { LoginTokensAndID } from '../../schemas/Tokens';
import { loginUser } from './controllers/loginController';
import { LoginInput } from './input/loginInput';

@Resolver()
export class LoginResolver {
  @Query(() => Boolean)
  hello() {
    return true;
  }

  @Mutation(() => LoginTokensAndID)
  async login(
    @Arg('data') { usernameOrEmail, password }: LoginInput
  ): Promise<LoginTokensAndID | never> {
    const tokens = await loginUser({ usernameOrEmail, password });

    return tokens;
  }
}
