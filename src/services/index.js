import fixeService from './fixed';
import stockService from './stock';
import cryptoService from './crypto';

const getSummary = async () => {
  const fixed = { total: await fixeService.getTotalPosition() };
  const stock = { total: await stockService.getTotalPosition() };
  const crypto = { total: await cryptoService.getTotalPosition() };
  return { fixed, stock, crypto };
};

export default {
  getSummary,
};
