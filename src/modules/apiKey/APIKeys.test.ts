import { createTestClient } from 'apollo-server-testing';
import { connect } from '../../connect';
import Redis from 'ioredis';

import { initializeServer } from '../../testingUtils/initializeServer';
import { getTestingToken } from '../../testingUtils/getTestingToken';
import { gql } from 'apollo-server-express';
import mongoose from 'mongoose';
import { doesNotMatch } from 'assert';

let redis: Redis.Redis;
let token: string;

beforeAll(async () => {
  // await connect(
  //   {
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
  // useCreateIndex: true,
  // useFindAndModify: false,
  //   },
  //   'test'
  // );

  await mongoose.connect('mongodb://localhost:27017/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  });
  redis = new Redis({ db: 10 });
  token = await getTestingToken();
});

afterAll(async (done) => {
  await mongoose.connection.close();
});

describe('APIKeys', () => {
  it('getKey', async () => {
    const GET_API_KEY = gql`
      query {
        getAPIKey {
          timestamp
          key
        }
      }
    `;

    const server = await initializeServer({ token });

    const { query } = createTestClient(server);

    const res = await query({ query: GET_API_KEY });

    expect(res.data).toBeTruthy();
  });
});
