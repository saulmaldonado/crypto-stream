import { ApolloError } from 'apollo-server-express';
import { ExpressContext } from 'apollo-server-express/dist/ApolloServer';
import { Arg, Ctx, Mutation, Query, Resolver } from 'type-graphql';

import { LoginTokensAndID } from '../../schemas/Tokens';
import { getUserID } from './controllers/getUserInfo';
import { loginUser } from './controllers/loginController';
import { LoginInput } from './input/loginInput';

@Resolver()
export class LoginResolver {
  @Query(() => String)
  getUserID(
    @Ctx() ctx: ExpressContext,
    @Arg('AccessToken', { nullable: true }) access_token?: string
  ): string | never {
    try {
      if (access_token) {
        return getUserID(access_token);
      } else {
        const token = ctx.req.headers.authorization?.split(' ')[1];
        return getUserID(token);
      }
    } catch (error) {
      throw new ApolloError(error, 'INTERNAL_SERVER_ERROR');
    }
  }

  @Mutation(() => LoginTokensAndID)
  async login(
    @Arg('data') { usernameOrEmail, password }: LoginInput
  ): Promise<LoginTokensAndID | never> {
    const tokens = await loginUser({ usernameOrEmail, password });

    return tokens;
  }
}
