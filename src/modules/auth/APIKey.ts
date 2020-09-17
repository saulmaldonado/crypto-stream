import { Ctx, Query, Resolver } from 'type-graphql';
import { Context } from './middleware/Context';
import { getKey } from './controllers/getAPIKey';

@Resolver()
export class APIKeyResolver {
  @Query(() => String)
  async getAPIKey(@Ctx() ctx: Context): Promise<string | never> {
    return await getKey(ctx);
  }
}
