import { pricePublishedInit } from '../modules/prices/publsihers/helpers/pricePublisherInit';
import { fetchAndPublish, startPricePublisher } from '../modules/prices/publsihers/pricePublush';
import { redis } from '../utils/redisCache';
import { pubSub } from '../utils/redisPubSub';

describe('pricePublishedInit', () => {
  jest.useFakeTimers();

  afterAll(async () => {
    jest.clearAllTimers();
  });

  it('should call function at every given interval', async () => {
    const mockFn = jest.fn();
    pricePublishedInit(mockFn, 2);

    jest.advanceTimersByTime(2000);

    expect(mockFn).toBeCalled();
  });
});

describe('startPricePublisher', () => {
  let fetchAndPublishMock: jest.SpyInstance<any, Parameters<typeof fetchAndPublish>>;

  beforeAll(async () => {
    jest.useFakeTimers();
    fetchAndPublishMock = jest.spyOn(
      await import('../modules/prices/publsihers/pricePublush'),
      'fetchAndPublish'
    );
    fetchAndPublishMock.mockImplementation(() => {});
  });

  afterAll(async () => {
    jest.clearAllTimers();
    redis.disconnect();
    await pubSub.close();
    fetchAndPublishMock.mockRestore();
  });

  it('should call callback method', async () => {
    startPricePublisher(pubSub, 2);

    jest.advanceTimersByTime(2000);

    expect(fetchAndPublishMock).toBeCalled();

    expect(true).toBeTruthy();
  });
});
