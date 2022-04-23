export default {
  crypto: {
    networks: {
      bsc: { host: 'https://api.bscscan.com' },
      polygon: { host: 'https://api.polygonscan.com' },
      avalanche: { host: 'https://api.snowtrace.io' },
    },
    tokens: {
      avalanche: {
        AVAX: { contract: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7' },
        PTP: { contract: '0x22d4002028f537599be9f666d1c4fa138522f9c8' },
      },
      bsc: {
        BNB: { contract: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c' },
        BUSD: { contract: '0xe9e7cea3dedca5984780bafc599bd69add087d56' },
        DOGS: { contract: '0xDBdC73B95cC0D5e7E99dC95523045Fc8d075Fb9e' },
        TITANO: { contract: '0x4e3cABD3AD77420FF9031d19899594041C420aeE' },
      },
      polygon: {
        SPHERE: { contract: '0x8d546026012bf75073d8a586f24a5d5ff75b9716' },
      },
    },
  },
};
