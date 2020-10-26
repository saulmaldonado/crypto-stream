import axios from 'axios';
import { fetchNewPrices } from '../modules/prices/controllers/helpers/fetchNewPrices';

describe('fetchPrices', () => {
  let axiosGetMock: jest.SpyInstance;
  beforeAll(() => {
    axiosGetMock = jest.spyOn(axios, 'get');

    axiosGetMock.mockImplementation(() => {
      throw new Error(); // mock a failing external API request
    });
  });

  afterAll(() => {
    axiosGetMock.mockRestore();
  });

  it('should throw "EXTERNAL_API_ERROR" on fetch error', async () => {
    await expect(async () => {
      await fetchNewPrices();
    }).rejects.toThrow();
  });
});
