import { ResolverData } from 'type-graphql';
import { getInvalidTestingToken, getTestingToken } from '../../../utils/testing/getTestingToken';
import { customAuthChecker } from '../middleware/authChecker';
import { Context } from '../middleware/Context';

let token: string;
let invalidToken: string;
beforeAll(async () => {
  token = await getTestingToken();
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
