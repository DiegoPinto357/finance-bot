import blockchainScan from '../../providers/blockchainScan';
import config from '../../config';

const getTotalPosition = async () => {
  const [titanoAmount, sphereAmount] = await Promise.all([
    blockchainScan.getTokenBalance(config.crypto.tokens.titano),
    await blockchainScan.getTokenBalance(config.crypto.tokens.sphere),
  ]);

  return { titanoAmount, sphereAmount };
};

export default {
  getTotalPosition,
};
