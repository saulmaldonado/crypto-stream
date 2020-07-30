import { getModelForClass } from '@typegoose/typegoose';
import { CollectionNames } from '../config/DbConfig';
import { User } from '../schemas/Users';

export const UsersModel = getModelForClass(User, {
  schemaOptions: { collection: CollectionNames.AUTH },
});
