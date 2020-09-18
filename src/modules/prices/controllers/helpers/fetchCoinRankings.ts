import axios from 'axios';

/**
 * Fetches and return an array of the top 100 coins by market cap
 *
 * @returns {Array<{name {string}, coinID {string}, rank {number}}>}
 */
export const fetchRankings = async () => {
  const {
    data: { data },
  } = await axios.get<CoinMarketCapRanking>(
    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/map?CMC_PRO_API_KEY=${process.env.COIN_MARKET_CAP_KEY}&limit=100`
  );

  return data.map((coin, index) => ({
    name: coin.name,
    coinID: coin.id,
    rank: index,
  }));
};

/**
 * Cycles fetchRankings methods to automatically fetch new ranking at every interval
 *
 * @param {Function} fn function to cycle
 * @param {Number} interval interval to fetch new rankings by hour
 */
export const coinRankingsInit = (fn: () => void, interval: number) => {
  const ONE_HOUR = 1000 * 60 * 60;
  const now = new Date();
  const nextHour = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    now.getHours() + 1,
    0,
    0,
    0
  );

  const diff = nextHour.getTime() - now.getTime();

  const loop = () => {
    fn();
    setInterval(fn, interval * ONE_HOUR);
  };

  fn();
  if (diff > 1000) {
    setTimeout(loop, diff);
  } else {
    loop();
  }
};

type CoinMarketCapRanking = {
  data: Array<{
    id: number;
    name: string;
    symbol: string;
    slug: string;
    is_active: number;
    first_historical_data: string;
    last_historical_data: string;
  }>;
};
