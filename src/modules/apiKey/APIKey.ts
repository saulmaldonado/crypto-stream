import { Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { APIKey } from '../../schemas/APIkey';
import { Context } from '../auth/middleware/Context';
import { getKey } from './controllers/getAPIKey';
import { refreshAPIKey } from './controllers/refreshAPIKey';

@Resolver()
export class APIKeyResolver {
  @Query(() => APIKey)
  @Authorized()
  async getAPIKey(@Ctx() ctx: Context): Promise<APIKey | never> {
    return getKey(ctx);
  }

  @Mutation(() => APIKey)
  async refreshAPIKey(@Ctx() ctx: Context): Promise<APIKey | never> {
    return refreshAPIKey(ctx);
  }
}
