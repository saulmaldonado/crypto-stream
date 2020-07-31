import { Resolver, Mutation, Arg, Query } from 'type-graphql';
import { User } from '../../schemas/User';
import { addNewPortfolio } from './controllers/addPortfolio';
import { getUserPortfolio } from './controllers/getPortfolio';
import { AddPortfolioInput } from './input/AddPortfolioInput';

@Resolver()
export class UserResolver {
  @Query(() => User)
  async getPortfolio(@Arg('userID') userID: string): Promise<User | never> {
    return await getUserPortfolio(userID);
  }

  @Mutation(() => User)
  async addPortfolio(@Arg('data') { userID, username }: AddPortfolioInput): Promise<User | never> {
    return await addNewPortfolio(userID, username);
  }
}
