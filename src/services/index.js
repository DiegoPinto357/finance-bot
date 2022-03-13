import cryptoService from './crypto';

const getSummary = async () => {
  const fixed = { total: 0 };
  const stock = { total: 0 };
  const crypto = { total: await cryptoService.getTotalPosition() };
  return { fixed, stock, crypto };
};

export default {
  getSummary,
};
