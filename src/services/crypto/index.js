import hodlService from './hodl';

const types = ['hodl'];

const getServiceByportfolioType = portfolioType => {
  switch (portfolioType) {
    case 'hodl':
      return hodlService;

    default:
      console.error('Invalid portfolio type.');
  }
};

const getBalance = async portfolioType => {
  const service = getServiceByportfolioType(portfolioType);
  return service.getBalance();
};

const getTotalPosition = async () => {
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
