const { promises: fs } = require('fs');
const path = require('path');

const mockDir = `${path.resolve()}/mockData/coinMarketCap/`;

const getSymbolPrice = jest.fn(async symbol => {
  const filename = `${mockDir}symbolPrices.json`;
  const tokens = JSON.parse(await fs.readFile(filename, 'utf-8'));
  const { price } = tokens.find(item => item.asset === symbol);
  return price;
});

module.exports = {
  getSymbolPrice,
};
