const hodlService = require('./hodl');
const defiService = require('./defi');
const defi2Service = require('./defi2');
const backedService = require('./backed');
const binanceBufferService = require('./binanceBuffer');

const PortfolioTypes = ['hodl', 'defi', 'defi2', 'backed', 'binanceBuffer'];

const getServiceByPortfolioType = portfolioType => {
  switch (portfolioType) {
    case 'hodl':
      return hodlService;

    case 'defi':
      return defiService;

    case 'defi2':
      return defi2Service;

    case 'backed':
      return backedService;

    case 'binanceBuffer':
      return binanceBufferService;

    default:
      console.error('Invalid portfolio type.');
  }
};

const getBalance = async portfolioType => {
  const service = getServiceByPortfolioType(portfolioType);
  return service.getBalance();
};

const getTotalPosition = async portfolioType => {
  if (portfolioType) {
    const service = getServiceByPortfolioType(portfolioType);
    return service.getTotalPosition();
  }

  const totals = await Promise.all(
    PortfolioTypes.map(async type => {
      const service = getServiceByPortfolioType(type);
      return await service.getTotalPosition();
    })
  );

  return totals.reduce((obj, current, index) => {
    obj[PortfolioTypes[index]] = current;
    return obj;
  }, {});
};

const getPosition = async ({ type, asset }) => {
  const service = getServiceByPortfolioType(type);
  return await service.getTotalPosition(asset);
};

const setAssetValue = async ({ asset, value }) => {
  asset = asset ? asset : 'binanceBuffer';

  if (asset !== 'binanceBuffer') {
    return { status: 'cannotSetValue' };
  }

  await binanceBufferService.setAssetValue({ value });
  return { status: 'ok' };
};

const deposit = async ({ asset, value }) => {
  asset = asset ? asset : 'binanceBuffer';

  if (asset !== 'binanceBuffer' && asset !== 'backed') {
    return { status: 'cannotDepositValue' };
  }

  const service = getServiceByPortfolioType(asset);
  return await service.deposit({ value });
};

const getHistory = async portfolioType => {
  const service = getServiceByPortfolioType(portfolioType);
  return service.getHistory();
};

module.exports = {
  PortfolioTypes,

  getBalance,
  getTotalPosition,
  getPosition,
  setAssetValue,
  deposit,
  getHistory,
};
