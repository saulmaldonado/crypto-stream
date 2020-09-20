import { Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { Context } from '../auth/middleware/Context';
import { getKey } from './controllers/getAPIKey';
import { refreshAPIKey } from './controllers/refreshAPIKey';

@Resolver()
export class APIKeyResolver {
  @Query(() => String)
  @Authorized()
  async getAPIKey(@Ctx() ctx: Context): Promise<string | never> {
    return getKey(ctx);
  }

  @Mutation(() => String)
  async refreshAPIKey(@Ctx() ctx: Context) {
    return refreshAPIKey(ctx);
  }
}
