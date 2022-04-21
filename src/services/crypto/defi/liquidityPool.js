import blockchain from '../../../providers/blockchain';
import coinMarketCap from '../../../providers/coinMarketCap';

const getTokens = lpToken => lpToken.split('-').slice(0, 2);

const getTokenTotalValue = async ({ token, network, wallet }) => {
  const balance = await blockchain.getTokenBalance({
    asset: token,
    network,
    wallet,
  });
  const price = await coinMarketCap.getSymbolPrice(token);
  return balance * price;
};

const getLPTokenPrice = async ({ lpToken, network, contractAddress }) => {
  const totalSupply = await blockchain.getContractTokenTotalSupply({
    network,
    contractAddress,
  });

  const tokens = getTokens(lpToken);

  const values = await Promise.all(
    tokens.map(token =>
      getTokenTotalValue({
        token,
        network,
        wallet: contractAddress,
      })
    )
  );

  const totalValue = values.reduce((total, value) => total + value, 0);
  return totalValue / totalSupply;
};

export default {
  getLPTokenPrice,
};
