const blockchain = require('../../../../providers/blockchain');
const getSymbolPrice = require('./getSymbolPrice');

const getTokens = lpToken => lpToken.split('-').slice(0, 2);

const getTokenTotalValue = async ({ token, network, wallet }) => {
  const balance = await blockchain.getTokenBalance({
    asset: token,
    network,
    wallet,
  });
  const price = await getSymbolPrice(token, network);
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

module.exports = {
  getLPTokenPrice,
};
