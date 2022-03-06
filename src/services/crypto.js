import { promises as fs } from 'fs';
import { MainClient } from 'binance';

const numOfCols = 13;

const exchangeClient = new MainClient({
  api_key: process.env.BINANCE_API_KEY,
  api_secret: process.env.BINANCE_API_SECRET,
});

const getBalance = async () => {
  const { balances } = await exchangeClient.getAccountInformation();
  const binanceSpot = balances.filter(item => parseFloat(item.free) !== 0);
  const binanceEarn = JSON.parse(
    await fs.readFile('./userData/crypto/binance-earn.json', 'utf-8')
  );

  return binanceSpot.map(item => {
    let earn = 0;
    Object.entries(binanceEarn).some(([key, value]) => {
      if (key === item.asset) {
        earn = Array.isArray(value.amount)
          ? value.amount.reduce((acc, current) => (acc += current), 0)
          : value.amount;
        return true;
      }
    });

    const spot = parseFloat(item.free);
    return { asset: item.asset, spot, earn, total: spot + earn };
  });
};

export default {
  getBalance,
};
