import { getModelForClass } from '@typegoose/typegoose';

import { CollectionNames } from '../config/DbConfig';
import { User } from '../schemas/User';
import { UserAuth } from '../schemas/UsersAuth';

export const UsersAuthModel = getModelForClass(UserAuth, {
  schemaOptions: { collection: CollectionNames.AUTH },
});

export const UsersModel = getModelForClass(User, {
  schemaOptions: { collection: CollectionNames.USERS },
});
