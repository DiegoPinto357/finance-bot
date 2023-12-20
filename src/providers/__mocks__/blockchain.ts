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

let accountBalance = new Map<string, Token[]>();

const loadWalletData = async (walletAddress: string) => {
  const filename = `${mockDir}tokenBalances/${walletAddress}.json`;
  accountBalance.set(
    walletAddress,
    JSON.parse(await fs.readFile(filename, 'utf-8'))
  );
};

const getTokenBalance = jest.fn(async ({ asset, wallet }) => {
  const walletAddress = wallet || process.env.CRYPTO_WALLET_ADDRESS;
  if (!accountBalance.get(walletAddress)) {
    await loadWalletData(walletAddress);
  }

  const walletData = accountBalance.get(walletAddress);
  if (!walletData) return 0;
  const token = walletData.find(item => item.asset === asset);
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

const simulateDeposit = async (
  wallet: string,
  assetName: string,
  amount: number
) => {
  if (!accountBalance.get(wallet)) {
    await loadWalletData(wallet);
  }

  const walletData = accountBalance.get(wallet);
  if (!walletData) return;
  const asset = walletData.find(item => item.asset === assetName);
  if (!asset) return;
  asset.amount = asset.amount + amount;
};

const resetMockValues = () => accountBalance.clear();

export default {
  getTokenBalance,
  getContractTokenTotalSupply,

  simulateDeposit,
  resetMockValues,
};
