import { getModelForClass } from '@typegoose/typegoose';
import { CollectionNames } from '../config/DbConfig';
import { Coin } from '../schemas/Coin';

export const CoinModel = getModelForClass(Coin, {
  schemaOptions: { collection: CollectionNames.USERS },
});
