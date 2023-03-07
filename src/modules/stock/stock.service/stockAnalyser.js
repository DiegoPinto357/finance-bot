import fundamentus from '../../../providers/fundamentus';
import fundamentei from '../../../providers/fundamentei';

const stocksList = [
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

const analysePortfolio = async () => {
  const partialStocksInfo = await fundamentus.getStocksInfo(stocksList);
  const stocksInfo = await Promise.all(
    partialStocksInfo.map(async partialStockInfo => {
      const furtherStockInfo = await fundamentei.getStockInfo(
        partialStockInfo.Papel
      );
      return { ...partialStockInfo, ...furtherStockInfo };
    })
  );

  console.table(stocksInfo);
};

analysePortfolio();

export default {
  analysePortfolio,
};
