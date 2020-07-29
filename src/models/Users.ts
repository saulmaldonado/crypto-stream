import { getModelForClass } from '@typegoose/typegoose';
import { UserInputError } from 'apollo-server-express';
import { User } from '../schemas/Users';

const UsersModel = getModelForClass(User, {
  schemaOptions: { collection: 'auth' },
});

export const createUser = async (user: User): Promise<User | never> => {
  try {
    return await UsersModel.create(user);
  } catch (error) {
    throw new UserInputError(error.message);
  }
};
