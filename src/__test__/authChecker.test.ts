/* eslint-disable jest/valid-expect */
import { ResolverData } from 'type-graphql';
import { config } from 'dotenv';
import { getInvalidTestingToken } from './utils/getTestingToken';
import { customAuthChecker } from '../modules/auth/middleware/authChecker';
import { Context } from '../modules/auth/middleware/Context';

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

    expect(async () => {
      await customAuthChecker(context as ResolverData<Context>, []);
    }).rejects.toThrow();
  });
});
