import { Resolver, Mutation, Arg, Query, Ctx, Authorized } from 'type-graphql';

import { Portfolio } from '../../schemas/Portfolio';
import { getTokenUserID } from '../auth/jwt/getTokenUserID';
import { isManagement } from '../auth/jwt/isManagement';
import { Context } from '../auth/middleware/Context';
import { addNewPortfolio } from './controllers/addPortfolio';
import { getUserPortfolios } from './controllers/getPortfolio';
import { getPortfolioById } from './controllers/getPortfolioById';
import { AddPortfolioInput } from './input/AddPortfolioInput';

@Resolver(Portfolio)
export class PortfolioResolver {
  @Authorized()
  @Query(() => [Portfolio], { nullable: 'items' })
  async getPortfolios(
    @Ctx() ctx: Context,
    @Arg('userID', { nullable: true }) userID?: string
  ): Promise<Portfolio[] | never> {
    if (userID) {
      isManagement(ctx);
    } else {
      userID = getTokenUserID(ctx);
    }
    return getUserPortfolios(userID);
  }

  @Authorized()
  @Query(() => Portfolio, { nullable: true })
  async getPortfolioByID(
    @Ctx() ctx: Context,
    @Arg('portfolioID') portfolioID: string,
    @Arg('userID', { nullable: true }) userID?: string
  ): Promise<Portfolio | null | never> {
    if (userID) {
      isManagement(ctx);
    }

    return getPortfolioById(portfolioID);
  }

  @Authorized()
  @Mutation(() => Portfolio)
  async addPortfolio(
    @Arg('data') { userID, username }: AddPortfolioInput
  ): Promise<Portfolio | never> {
    return addNewPortfolio(userID, username);
  }
}
