import { ResolverData } from 'type-graphql';
import { config } from 'dotenv';
import { getInvalidTestingToken } from '../../../utils/testing/getTestingToken';
import { customAuthChecker } from '../middleware/authChecker';
import { Context } from '../middleware/Context';

config();

let invalidToken: string;
beforeAll(async () => {
  invalidToken = getInvalidTestingToken();
});

describe('authChecker', () => {
  it('should unauthorize request with missing token', async () => {
    const result = await customAuthChecker({ context: {} } as ResolverData<Context>, []);

    expect(result).toBeFalsy();
  });

  it('should unauthorize requests with an invalid token', async () => {
    const context = { context: { token: invalidToken } };

    const result = await customAuthChecker(context as ResolverData<Context>, []);

    expect(result).toBeFalsy();
  });
});
