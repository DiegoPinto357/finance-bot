import blockchain from '../../../../providers/blockchain';
import getSymbolPrice from './getSymbolPrice';

import type { CryptoNetwork } from '../../types';

const getTokens = (lpToken: string) => lpToken.split('-').slice(0, 2);

const getTokenTotalValue = async ({
  token,
  network,
  walletAddress,
}: {
  token: string;
  network: CryptoNetwork;
  walletAddress: string;
}) => {
  const balance = await blockchain.getTokenBalance({
    asset: token,
    network,
    wallet: walletAddress,
  });
  const price = await getSymbolPrice(token, network);
  return balance * price;
};

const getLPTokenPrice = async ({
  lpToken,
  network,
  contractAddress,
}: {
  lpToken: string;
  network: CryptoNetwork;
  contractAddress: string;
}) => {
  const totalSupply = await blockchain.getContractTokenTotalSupply({
    network,
    contractAddress,
  });

  if (totalSupply === 0) {
    return 0;
  }

  const tokens = getTokens(lpToken);

  const values = await Promise.all(
    tokens.map(token =>
      getTokenTotalValue({
        token,
        network,
        walletAddress: contractAddress,
      })
    )
  );

  const totalValue = values.reduce((total, value) => total + value, 0);
  return totalValue / totalSupply;
};

export default {
  getLPTokenPrice,
};
