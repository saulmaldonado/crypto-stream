import { getModelForClass } from '@typegoose/typegoose';

import { CollectionNames } from '../config/DbConfig';
import { Portfolio } from '../schemas/Portfolio';
import { UserAuth } from '../schemas/UsersAuth';

export const UsersAuthModel = getModelForClass(UserAuth, {
  schemaOptions: { collection: CollectionNames.AUTH },
});

export const PortfolioModel = getModelForClass(Portfolio, {
  schemaOptions: { collection: CollectionNames.PORTFOLIOS },
});
