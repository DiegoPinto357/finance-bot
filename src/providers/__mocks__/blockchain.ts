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

let accountBalance: Record<string, Token[]> | undefined;

const loadWalletData = async (walletPath: string) => {
  const filename = `${mockDir}tokenBalances/${walletPath}.json`;
  accountBalance = {
    [walletPath]: JSON.parse(await fs.readFile(filename, 'utf-8')),
  };
};

const getTokenBalance = jest.fn(async ({ asset, wallet }) => {
  const walletPath = wallet || process.env.CRYPTO_WALLET_ADDRESS;
  if (!accountBalance || !accountBalance[walletPath]) {
    await loadWalletData(walletPath);
  }
  const token = accountBalance![walletPath].find(item => item.asset === asset);

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

const resetMockValues = () => (accountBalance = undefined);

export default {
  getTokenBalance,
  getContractTokenTotalSupply,

  resetMockValues,
};
