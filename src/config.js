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
        AVAX: {
          contract: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
        },
        PTP: {
          contract: '0x22d4002028f537599be9f666d1c4fa138522f9c8',
        },
      },
      bsc: {
        TITANO: {
          contract: '0xBA96731324dE188ebC1eD87ca74544dDEbC07D7f',
        },
      },
      polygon: {
        SPHERE: {
          contract: '0x8d546026012bf75073d8a586f24a5d5ff75b9716',
        },
      },
    },
  },
};
