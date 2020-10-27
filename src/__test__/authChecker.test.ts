/* eslint-disable jest/valid-expect */
import { ResolverData } from 'type-graphql';
import { config } from 'dotenv';
import { getInvalidTestingToken, getTestingToken } from './utils/getTestingToken';
import { customAuthChecker } from '../modules/auth/middleware/authChecker';
import { Context } from '../modules/auth/middleware/Context';

config();

let invalidToken: string;
let validToken: string;
const { AUTH0_CLIENT_ID } = process.env;
const { AUTH0_API_ID } = process.env;

beforeAll(async () => {
  invalidToken = getInvalidTestingToken();
  validToken = await getTestingToken();
});

afterAll(() => {
  process.env.AUTH0_CLIENT_ID = AUTH0_CLIENT_ID;
  process.env.AUTH0_API_ID = AUTH0_API_ID;
});
describe('authChecker', () => {
  it('should unauthorize request with missing token', async () => {
    const result = await customAuthChecker({ context: {} } as ResolverData<Context>, []);

    expect(result).toBeFalsy();
  });

  it('should unauthorize requests with an invalid token', async () => {
    const context = { context: { token: invalidToken } };

    expect(async () => {
      await customAuthChecker(context as ResolverData<Context>, []);
    }).rejects.toThrow();
  });

  it('should unauthorize for non-matching auth0 credentials', async () => {
    process.env.AUTH0_CLIENT_ID = 'invalidID';
    process.env.AUTH0_API_ID = 'invalidID';

    const context = { context: { token: validToken } };

    const result = await customAuthChecker(context as ResolverData<Context>, []);

    expect(result).toBe(false);
  });
});
