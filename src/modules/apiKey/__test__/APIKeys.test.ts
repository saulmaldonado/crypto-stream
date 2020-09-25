import { createTestClient } from 'apollo-server-testing';
import mongoose from 'mongoose';
import { gql } from 'apollo-server-express';

import { initializeTestingServer } from '../../../utils/testing/initializeServer';
import { getInvalidTestingToken, getTestingToken } from '../../../utils/testing/getTestingToken';
import { APIKeyResolver } from '../APIKey';
import { KeyModel } from '../../../models/Key';

let token: string;

beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/test3', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  token = await getTestingToken();
});

afterEach(async () => {
  await KeyModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe('APIKeys: getAPIKey', () => {
  const GET_API_KEY = gql`
    query {
      getAPIKey {
        timestamp
        key
      }
    }
  `;

  it('should create new API key', async () => {
    const server = await initializeTestingServer([APIKeyResolver], { token });
    const { query } = createTestClient(server);
    const res = await query({ query: GET_API_KEY });

    expect(res.data).toBeTruthy();
    expect(res.data?.getAPIKey.key).toBeTruthy();

    const key = res.data?.getAPIKey.key as string;
    const keyID = key.split('.')[0];

    const DBkey = await KeyModel.findOne({ _id: keyID });

    expect(DBkey).toBeTruthy();
    expect(DBkey?._id).toBe(keyID);
  });

  it('should return the same API key when called twice', async () => {
    const server = await initializeTestingServer([APIKeyResolver], { token });
    const { query } = createTestClient(server);
    const res1 = await query({ query: GET_API_KEY });

    expect(res1.data).toBeTruthy();
    expect(res1.data?.getAPIKey.key).toBeTruthy();

    const key1 = res1.data?.getAPIKey.key as string;

    const res2 = await query({ query: GET_API_KEY });

    expect(res2.data).toBeTruthy();
    expect(res2.data?.getAPIKey.key).toBeTruthy();

    const key2 = res2.data?.getAPIKey.key as string;

    expect(key1).toEqual(key2);
  });

  it('should fail with an invalid API key', async () => {
    const invalidToken = getInvalidTestingToken();
    const server = await initializeTestingServer([APIKeyResolver], { token: invalidToken });
    const { query } = createTestClient(server);
    const res = await query({ query: GET_API_KEY });

    expect(res.errors).toBeTruthy();
    expect(res.data).toBeFalsy();
  });
});

describe('APIKeys: refreshAPIKey', () => {
  const REFRESH_API_KEY = gql`
    mutation {
      refreshAPIKey {
        key
        timestamp
      }
    }
  `;
  const GET_API_KEY = gql`
    query {
      getAPIKey {
        timestamp
        key
      }
    }
  `;

  let testKey: string;

  beforeEach(async () => {
    const server = await initializeTestingServer([APIKeyResolver], { token });
    const { query } = createTestClient(server);

    const res = await query({ query: GET_API_KEY });

    testKey = res.data?.getAPIKey.key;
  });

  it('should return a new API key', async () => {
    const server = await initializeTestingServer([APIKeyResolver], { token });
    const { mutate } = createTestClient(server);

    const res = await mutate({ mutation: REFRESH_API_KEY });

    expect(res.data).toBeTruthy();
    expect(res.data?.refreshAPIKey.key).toBeTruthy();

    const key = res.data?.refreshAPIKey.key as string;
    const keyID = key.split('.')[0];

    const DBkey = await KeyModel.findOne({ _id: keyID });

    expect(DBkey).toBeTruthy();
    expect(DBkey?._id).toBe(keyID);

    expect(key).not.toBe(testKey);
  });

  it('should fail with an invalid API key', async () => {
    const invalidToken = getInvalidTestingToken();
    const server = await initializeTestingServer([APIKeyResolver], { token: invalidToken });
    const { mutate } = createTestClient(server);
    const res = await mutate({ mutation: REFRESH_API_KEY });

    expect(res.errors).toBeTruthy();
    expect(res.data).toBeFalsy();
  });
});
