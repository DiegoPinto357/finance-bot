const fixed = require('./modules/fixed/fixed.service');
const stock = require('./modules/stock/stock.service');
const crypto = require('./modules/crypto/crypto.service');
const portfolio = require('./modules/portfolio/portfolio.service');

module.exports = {
  fixed,
  stock,
  crypto,
  portfolio,
};
