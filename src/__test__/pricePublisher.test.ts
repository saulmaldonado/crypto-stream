import { pricePublishedInit } from '../modules/prices/publsihers/helpers/pricePublisherInit';

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
