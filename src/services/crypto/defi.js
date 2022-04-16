import blockchainScan from '../../providers/blockchainScan';

const getTotalPosition = async () => {
  const titanoAmount = await blockchainScan.getTokenBalance({
    network: 'bsc',
    token: 'titano',
  });

  const sphereAmount = await blockchainScan.getTokenBalance({
    network: 'polygon',
    token: 'sphere',
  });

  return { titanoAmount, sphereAmount };
};

export default {
  getTotalPosition,
};
