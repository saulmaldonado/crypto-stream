import { Resolver, Mutation, Arg, Query } from 'type-graphql';
import { User } from '../../schemas/User';
import { addNewPortfolio } from './controllers/addPortfolio';
import { getUserPortfolio } from './controllers/getPortfolio';
import { AddPortfolioInput } from './input/AddPortfolioInput';

@Resolver()
export class RegisterResolver {
  @Query(() => User)
  async getPortfolio(@Arg('userID') userID: string) {
    const user = await getUserPortfolio(userID);

    return user;
  }

  @Mutation(() => User)
  async addPortfolio(@Arg('data') { userID, username }: AddPortfolioInput): Promise<User | never> {
    return await addNewPortfolio(userID, username);
  }
}
