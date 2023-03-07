import httpClient from '../libs/httpClient';
import * as cheerio from 'cheerio';
import { buildLogger } from '../libs/logger';

const log = buildLogger('Fundamentei');

const baseURL = 'http://fundamentei.com/br/';

const stockTypes = {
  3: 'ON',
  4: 'PN',
  5: 'PN',
};

const getStockInfo = async stock => {
  log(`Loading ${stock} stock info.`);
  const url = `${baseURL}${stock}`;
  const data = await httpClient.get(url);

  const $ = cheerio.load(data);
  const node = $('#__NEXT_DATA__').get(0);
  const stocksInfo = JSON.parse(node.firstChild.data);

  const stockType = stockTypes[stock.slice(-1)];

  const {
    freeFloat,
    tagAlong,
    sector,
    reclameAquiRatings,
    majorityShareholders,
    listingSegment,
  } = Object.values(stocksInfo.props.apolloState.data).find(
    value => value.freeFloat
  );

  return {
    freeFloat:
      (stockType === 'ON'
        ? freeFloat.percentageOfTotalSharesOfCommonStock
        : freeFloat.percentageOfTotalSharesOfPreferredStock) / 100,
    tagAlong:
      (stockType === 'ON' ? tagAlong.commonStock : tagAlong.preferredStock) /
      100,
    sector,
    reclameAquiRatings: reclameAquiRatings?.finalScore,
    governmentHoldings:
      majorityShareholders
        .filter(
          ({ isGovernmentOrGovernmentRelated }) =>
            isGovernmentOrGovernmentRelated
        )
        .reduce(
          (sum, { percentageOfTotalShares }) => sum + percentageOfTotalShares,
          0
        ) / 100,
    listingSegment,
  };
};

export default {
  getStockInfo,
};
