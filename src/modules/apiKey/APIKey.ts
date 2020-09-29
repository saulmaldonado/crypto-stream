import { Authorized, Ctx, Mutation, Query, Resolver } from 'type-graphql';
import { APIKey } from '../../schemas/APIkey';
import { Context } from '../auth/middleware/Context';
import { getKey } from './controllers/getAPIKey';
import { refreshAPIKey } from './controllers/refreshAPIKey';
import metadata from './APIKey.metadata.json';

@Resolver()
export class APIKeyResolver {
  @Query(() => APIKey, { description: metadata.getAPIKey.description })
  @Authorized()
  async getAPIKey(@Ctx() ctx: Context): Promise<APIKey | never> {
    return getKey(ctx);
  }

  @Mutation(() => APIKey, { description: metadata.refreshAPIKey.description })
  async refreshAPIKey(@Ctx() ctx: Context): Promise<APIKey | never> {
    return refreshAPIKey(ctx);
  }
}
