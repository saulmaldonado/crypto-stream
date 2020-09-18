import axios from 'axios';

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

export const coinRankingsInit = (fn: () => void, interval: number) => {
  const now = new Date();
  const nextMinute = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);

  const diff = nextMinute.getTime() - now.getTime();

  const loop = () => {
    fn();
    setInterval(fn, interval * 1000);
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
