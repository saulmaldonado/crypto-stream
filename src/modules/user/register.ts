import { Resolver, Query, Mutation, Arg } from 'type-graphql';
import { hash } from 'argon2';

import { createUser } from '../../models/Users';
import { User } from '../../schemas/Users';
import { ApolloError, UserInputError } from 'apollo-server-express';
import { Error } from 'mongoose';

@Resolver()
export class RegisterResolver {
  @Query(() => String)
  hello() {
    return 'Hello';
  }

  @Mutation(() => User)
  async register(
    @Arg('username') username: string,
    @Arg('email') email: string,
    @Arg('password') password: string
  ): Promise<User | void> {
    try {
      password = await hash(password);
    } catch (error) {
      new ApolloError(error.message, 'INTERNAL_SERVER_ERROR');
    }

    const user = await createUser({
      username,
      email,
      password,
    });

    return user;
  }
}
