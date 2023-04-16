const { promises: fs } = require('fs');
const path = require('path');

const mockDir = `${path.resolve()}/mockData/blockchain/`;

const getTokenBalance = jest.fn(async ({ asset, wallet }) => {
  const filename = `${mockDir}tokenBalances/${
    wallet || process.env.CRYPTO_WALLET_ADDRESS
  }.json`;
  const tokens = JSON.parse(await fs.readFile(filename, 'utf-8'));
  const token = tokens.find(item => item.asset === asset);

  if (!token) return 0;
  return token.amount;
});

const getContractTokenTotalSupply = jest.fn(async ({ contractAddress }) => {
  const filename = `${mockDir}contractTotalSupply.json`;
  const contracts = JSON.parse(await fs.readFile(filename, 'utf-8'));
  const { totalSupply } = contracts.find(
    item => item.contract === contractAddress
  );
  return totalSupply;
});

module.exports = {
  getTokenBalance,
  getContractTokenTotalSupply,
};
