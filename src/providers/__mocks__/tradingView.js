import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/tradingView/`;

const getTicker = jest.fn(async asset => {
  const filename = `${mockDir}tickers.json`;
  const tickers = JSON.parse(await fs.readFile(filename, 'utf-8'));
  const { lp, chp } = tickers.find(item => item.asset === asset);
  return { lp, chp };
});

export default {
  getTicker,
};
