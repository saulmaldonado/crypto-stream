import { ApolloError } from 'apollo-server-express';
import { hash } from 'argon2';
import { UsersModel } from '../../../models/Users';
import { User } from '../../../schemas/Users';
import { RegisterInput } from '../input/registerInput';

export const registerUser = async ({ password, ...user }: RegisterInput): Promise<User | void> => {
  try {
    password = await hash(password);
    return await UsersModel.create({ password, ...user });
  } catch (error) {
    new ApolloError(error.message, 'INTERNAL_SERVER_ERROR');
  }
};
