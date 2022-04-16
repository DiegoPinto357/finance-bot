import hodlService from './hodl';
import defiService from './defi';
import binanceBufferService from './binanceBuffer';

const types = ['hodl', 'defi', 'binanceBuffer'];

const getServiceByportfolioType = portfolioType => {
  switch (portfolioType) {
    case 'hodl':
      return hodlService;

    case 'defi':
      return defiService;

    case 'binanceBuffer':
      return binanceBufferService;

    default:
      console.error('Invalid portfolio type.');
  }
};

const getBalance = async portfolioType => {
  const service = getServiceByportfolioType(portfolioType);
  return service.getBalance();
};

const getTotalPosition = async portfolioType => {
  if (portfolioType) {
    const service = getServiceByportfolioType(portfolioType);
    return service.getTotalPosition();
  }

  const totals = await Promise.all(
    types.map(async type => {
      const service = getServiceByportfolioType(type);
      return await service.getTotalPosition();
    })
  );

  return totals.reduce((obj, current, index) => {
    obj[types[index]] = current;
    return obj;
  }, {});
};

const getHistory = async portfolioType => {
  const service = getServiceByportfolioType(portfolioType);
  return service.getHistory();
};

export default {
  getBalance,
  getTotalPosition,
  getHistory,
};
