import fixeService from './fixed';
import stockService from './stock';
import cryptoService from './crypto';

const getSummary = async () => {
  const [fixedTotal, stockTotal, cryptoTotal] = await Promise.all([
    fixeService.getTotalPosition(),
    stockService.getTotalPosition(),
    cryptoService.getTotalPosition(),
  ]);

  const fixed = { total: fixedTotal };
  const stock = { total: stockTotal };
  const crypto = { total: cryptoTotal };
  return { fixed, stock, crypto };
};

export default {
  getSummary,
};
