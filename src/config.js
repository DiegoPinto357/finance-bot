export default {
  crypto: {
    networks: {
      bsc: {
        host: 'https://api.bscscan.com',
      },
      polygon: {
        host: 'https://api.polygonscan.com',
      },
      avalanche: {
        host: 'https://api.snowtrace.io',
      },
    },
    tokens: {
      avalanche: {
        AVAX: { contract: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7' },
        PTP: { contract: '0x22d4002028f537599be9f666d1c4fa138522f9c8' },
      },
      bsc: {
        BNB: { contract: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
        DOGS: { contract: '0xDBdC73B95cC0D5e7E99dC95523045Fc8d075Fb9e' },
        TITANO: { contract: '0xBA96731324dE188ebC1eD87ca74544dDEbC07D7f' },
      },
      polygon: {
        SPHERE: { contract: '0x8d546026012bf75073d8a586f24a5d5ff75b9716' },
      },
    },
  },
};
