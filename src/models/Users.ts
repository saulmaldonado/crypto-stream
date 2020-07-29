import { getModelForClass } from '@typegoose/typegoose';
import { CollectionNames } from '../config/DbConfig';
import { RegisterInput } from '../modules/auth/input/registerInput';
import { User } from '../schemas/Users';

export const UsersModel = getModelForClass(User, {
  schemaOptions: { collection: CollectionNames.AUTH },
});

export const createUser = async (user: RegisterInput): Promise<User | void> => {
  try {
    return await UsersModel.create(user);
  } catch (error) {
    console.log(error);
  }
};
