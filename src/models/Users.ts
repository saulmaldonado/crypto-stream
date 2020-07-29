import { getModelForClass } from '@typegoose/typegoose';
import { UserInputError } from 'apollo-server-express';
import { MongoError } from 'mongodb';
import { User } from '../schemas/Users';

const UsersModel = getModelForClass(User, {
  schemaOptions: { collection: 'auth' },
});

export const createUser = async (user: User): Promise<User | void> => {
  try {
    return await UsersModel.create(user);
  } catch (error) {
    console.log(error);
  }
};
