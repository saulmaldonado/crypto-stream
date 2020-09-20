import { getModelForClass } from '@typegoose/typegoose';
import { CollectionNames } from '../config/DbConfig';
import { APIKeyModel } from '../schemas/APIkey';

export const KeyModel = getModelForClass(APIKeyModel, {
  schemaOptions: { collection: CollectionNames.API_KEYS, _id: false },
});
