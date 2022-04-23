import { promises as fs } from 'fs';
import path from 'path';

const mockDir = `${path.resolve()}/mockData/blockchain/`;

const getTokenBalance = jest.fn(async ({ asset }) => {
  const filename = `${mockDir}tokenBalances.json`;
  const tokens = JSON.parse(await fs.readFile(filename, 'utf-8'));
  const { amount } = tokens.find(item => item.asset === asset);
  return amount;
});

const getContractTokenTotalSupply = jest.fn(async ({ contractAddress }) => {
  const filename = `${mockDir}contractTotalSupply.json`;
  const contracts = JSON.parse(await fs.readFile(filename, 'utf-8'));
  const { totalSupply } = contracts.find(
    item => item.contract === contractAddress
  );
  return totalSupply;
});

export default {
  getTokenBalance,
  getContractTokenTotalSupply,
};
