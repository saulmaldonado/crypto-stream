import { getModelForClass } from '@typegoose/typegoose';
import { CollectionNames } from '../config/DbConfig';
import { APIKey } from '../schemas/APIkey';

export const KeyModel = getModelForClass(APIKey, {
  schemaOptions: { collection: CollectionNames.API_KEYS },
});
