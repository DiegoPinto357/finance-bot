import blockchainScan from '../../providers/blockchainScan';
import coinMarketCap from '../../providers/coinMarketCap';
import config from '../../config';

const { tokens } = config.crypto;

const getTotalPosition = async () => {
  const [titanoAmount, sphereAmount, titanoPrice, spherePrice] =
    await Promise.all([
      blockchainScan.getTokenBalance(tokens.titano),
      blockchainScan.getTokenBalance(tokens.sphere),
      coinMarketCap.getSymbolPrice(tokens.titano.name),
      coinMarketCap.getSymbolPrice(tokens.sphere.name),
    ]);

  const titanoPosition =
    titanoAmount * titanoPrice * (1 - tokens.titano.sellFee);
  const spherePosition =
    sphereAmount * spherePrice * (1 - tokens.sphere.sellFee);

  return titanoPosition + spherePosition;
};

export default {
  getTotalPosition,
};
