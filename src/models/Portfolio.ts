import { getModelForClass } from '@typegoose/typegoose';

import { CollectionNames } from '../config/DbConfig';
import { Portfolio } from '../schemas/Portfolio';

export const PortfolioModel = getModelForClass(Portfolio, {
  schemaOptions: { collection: CollectionNames.PORTFOLIOS },
});
