import { Resolver, Mutation, Arg, Query } from 'type-graphql';
import { hash } from 'argon2';

import { createUser } from '../../models/Users';
import { User } from '../../schemas/Users';
import { ApolloError } from 'apollo-server-express';
import { RegisterInput } from './input/registerInput';

@Resolver()
export class RegisterResolver {
  @Query(() => String)
  hello() {
    return 'hello';
  }

  @Mutation(() => User)
  async register(@Arg('data') { email, password, username }: RegisterInput): Promise<User | void> {
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

    console.log(user);

    return user;
  }
}
