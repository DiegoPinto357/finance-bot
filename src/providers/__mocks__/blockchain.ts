import { promises as fs } from 'fs';
import path from 'path';

interface Token {
  asset: string;
  amount: number;
}

interface Contract {
  contract: string;
  totalSupply: number;
}

const mockDir = `${path.resolve()}/mockData/blockchain/`;

const getTokenBalance = jest.fn(async ({ asset, wallet }) => {
  const filename = `${mockDir}tokenBalances/${
    wallet || process.env.CRYPTO_WALLET_ADDRESS
  }.json`;
  const tokens: Token[] = JSON.parse(await fs.readFile(filename, 'utf-8'));
  const token = tokens.find(item => item.asset === asset);

  if (!token) return 0;
  return token.amount;
});

const getContractTokenTotalSupply = jest.fn(async ({ contractAddress }) => {
  const filename = `${mockDir}contractTotalSupply.json`;
  const contracts: Contract[] = JSON.parse(
    await fs.readFile(filename, 'utf-8')
  );
  const contract = contracts.find(item => item.contract === contractAddress);

  if (!contract) {
    return 0;
  }

  return contract.totalSupply;
});

export default {
  getTokenBalance,
  getContractTokenTotalSupply,
};
