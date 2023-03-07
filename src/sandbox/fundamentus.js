import fundamentus from '../providers/fundamentus';

const portfolio = [
  'MRVE3',
  'ITSA3',
  'FLRY3',
  'MDIA3',
  'B3SA3',
  'ITUB3',
  'WIZC3',
  'EZTC3',
  'ENBR3',
  'CRPG5',
  'EGIE3',
  'SQIA3',
  'ROMI3',
  'ARZZ3',
  'WEGE3',
  'BBSE3',
];

const run = async () => {
  const stocks = await fundamentus.getStocksInfo(portfolio);
  console.table(stocks);
};

run();
