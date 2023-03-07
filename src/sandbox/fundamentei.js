import fundamentei from '../providers/fundamentei';

const run = async () => {
  const {
    freeFloat,
    tagAlong,
    sector,
    reclameAquiRatings,
    governmentHoldings,
    listingSegment,
  } = await fundamentei.getStockInfo('BBSE3');

  console.log({
    freeFloat,
    tagAlong,
    sector,
    reclameAquiRatings,
    governmentHoldings,
    listingSegment,
  });
};

run();
