const _ = require('lodash');
const fundamentus = require('../../../providers/fundamentus');
const fundamentei = require('../../../providers/fundamentei');
const { withCache } = require('../../../libs/cache');

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

const inverseLerp = (a, b, value) => (value - a) / (b - a);

const range = (value, { min, optimal, max }) => {
  if (!optimal) return inverseLerp(min, max, value);
  if (value <= optimal) return inverseLerp(min, optimal, value);
  return 1 - inverseLerp(optimal, max, value);
};

const saturate = (value, { min, max }) => {
  if (max && value > max) return max;
  if (min && value < min) return min;
  return value;
};

const calcPLMetric = value => {
  return range(value, { min: 3, optimal: 5, max: 20 });
};

const calcDivYieldMetric = value => {
  // return range(saturate(value, { min: 0, max: 1 }), { min: 0, max: 0.1 });
  return range(value, { min: 0, optimal: 7, max: 10 });
};

const calcPVpMetric = value => {
  return range(value, { min: 0, optimal: 0.5, max: 5 });
};

const calcMargLiqMetric = value => {
  return range(saturate(value, { min: 0, max: 0.2 }), { min: 0, max: 0.1 });
};

const calcDBPLMetric = value => {
  return 1 - range(saturate(value, { min: -2 }), { min: 0, max: 1 });
};

const calcROEMetric = value => {
  return range(saturate(value, { min: 0, max: 1 }), { min: 0, max: 0.1 });
};

const calcEvEbitMetric = value => {
  return range(value, { min: 0, optimal: 3, max: 50 });
};

const calcLiqMetric = value => {
  return range(saturate(value, { max: 500e6 }), { min: 1e6, max: 500e6 });
};

const calcFreeFloatMetric = value => {
  if (_.isNil(value)) return 0;
  return range(value, { min: 0, max: 0.5 });
};

const calcListingSegmentMetric = value => {
  return value === 'NOVO_MERCADO' ? 1 : 0;
};

const calcGovernmentHoldingsMetric = value => {
  if (_.isNil(value)) return 0;
  return 1 - range(value, { min: 0, max: 0.5 });
};

const calcReclameAquiRatingsMetric = value => {
  if (_.isNil(value)) return 0.5;
  return range(value, { min: 0, max: 10 });
};

// TODO move cache to provider
const getStocksInfoCached = withCache(
  params => fundamentus.getStocksInfo(params),
  { timeToLive: 24 * 60 * 60 * 1000 }
);

// TODO move cache to provider
const getStockInfoCached = withCache(
  params => fundamentei.getStockInfo(params),
  { timeToLive: 24 * 60 * 60 * 1000 }
);

// for (let i = 0; i < 100; i++) {
//   const value = i / 100;
//   const metric = calcGovernmentHoldingsMetric(value);
//   console.log({ value, metric });
// }

const analysePortfolio = async () => {
  const partialStocksInfo = await getStocksInfoCached(stocksList);
  const stocksInfo = await Promise.all(
    partialStocksInfo.map(async partialStockInfo => {
      try {
        const furtherStockInfo = await getStockInfoCached(
          partialStockInfo.Papel
        );
        return { ...partialStockInfo, ...furtherStockInfo };
      } catch (error) {
        return partialStockInfo;
      }
    })
  );

  // console.log(stocksInfo);

  const stocksMetrics = stocksInfo
    .map(stockInfo => {
      const metrics = {
        pl: calcPLMetric(stockInfo['P/L']),
        divYield: calcDivYieldMetric(stockInfo['Div.Yield']),
        pvp: calcPVpMetric(stockInfo['P/VP']),
        margLiq: 2 * calcMargLiqMetric(stockInfo['Mrg. Líq.']),
        dbpl: calcDBPLMetric(stockInfo['Dív.Brut/ Patrim.']),
        roe: calcROEMetric(stockInfo['ROE']),
        evEbit: calcEvEbitMetric(stockInfo['EV/EBIT']),
        liq: 10 * calcLiqMetric(stockInfo['Liq.2meses']),
        freeFloat: calcFreeFloatMetric(stockInfo['freeFloat']),
        listingSegment:
          5 * calcListingSegmentMetric(stockInfo['listingSegment']),
        governmentHoldings:
          2 * calcGovernmentHoldingsMetric(stockInfo['governmentHoldings']),
        reclameAquiRatings: calcReclameAquiRatingsMetric(
          stockInfo['reclameAquiRatings']
        ),
      };

      const totalScore = Object.values(metrics).reduce(
        (total, metric) => total + metric,
        0
      );

      return { stock: stockInfo.Papel, metrics, totalScore };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  console.table(
    stocksMetrics.map(({ stock, metrics, totalScore }) => ({
      stock,
      ...Object.entries(metrics).reduce((obj, [key, value]) => {
        return { ...obj, [key]: value.toFixed(2) };
      }, {}),
      totalScore,
    }))
  );
};

module.exports = {
  analysePortfolio,
};
