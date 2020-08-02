import { Resolver, Mutation, Arg, Query, Ctx } from 'type-graphql';

import { Portfolio } from '../../schemas/Portfolio';
import { getTokenUserID } from '../auth/jwt/getTokenUserID';
import { isManagement } from '../auth/jwt/isManagement';
import { Context } from '../auth/middleware/Context';
import { addNewPortfolio } from './controllers/addPortfolio';
import { getUserPortfolios } from './controllers/getPortfolio';
import { AddPortfolioInput } from './input/AddPortfolioInput';

@Resolver()
export class PortfolioResolver {
  @Query(() => [Portfolio], { nullable: 'items' })
  async getPortfolios(
    @Ctx() context: Context,
    @Arg('userID', { nullable: true }) userID?: string
  ): Promise<Portfolio[] | never> {
    if (!userID) {
      userID = getTokenUserID(context);
    } else {
      isManagement(context);
    }
    return await getUserPortfolios(userID);
  }

  @Mutation(() => Portfolio)
  async addPortfolio(
    @Arg('data') { userID, username }: AddPortfolioInput
  ): Promise<Portfolio | never> {
    return await addNewPortfolio(userID, username);
  }
}
