import { getModelForClass } from '@typegoose/typegoose';
import { CollectionNames } from '../config/DbConfig';
import { Transaction } from '../schemas/Transaction';

export const TransactionModel = getModelForClass(Transaction, {
  schemaOptions: { collection: CollectionNames.USERS },
});
