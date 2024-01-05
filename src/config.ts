import { CryptoNetwork } from './modules/crypto/types';
interface Config {
  cache: {
    disabled: boolean;
    defaultTimeToLive: number;
  };
  crypto: {
    networks: {
      [key in CryptoNetwork]: {
        host: string;
      };
    };
    tokens: {
      [key in CryptoNetwork]: {
        [key: string]: {
          contract: string;
          native?: boolean;
          cmcId?: number;
        };
      };
    };
  };
}

const config: Config = {
  cache: {
    disabled: false,
    defaultTimeToLive: 20 * 60 * 1000,
  },
  crypto: {
    networks: {
      bsc: { host: 'https://api.bscscan.com' },
      polygon: { host: 'https://api.polygonscan.com' },
      avalanche: { host: 'https://api.snowtrace.io' },
    },
    tokens: {
      avalanche: {
        AVAX: {
          contract: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
          native: true,
        },
        PTP: { contract: '0x22d4002028f537599bE9f666d1c4Fa138522f9c8' },
        WMEMO: { contract: '0x0da67235dD5787D67955420C84ca1cEcd4E5Bb3b' },
        BSGG: { contract: '0x63682bDC5f875e9bF69E201550658492C9763F89' },
        SPELL: { contract: '0xCE1bFFBD5374Dac86a2893119683F4911a2F7814' },
        'USDC.e': { contract: '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664' },
        USDTt: { contract: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7' },
      },
      bsc: {
        BNB: {
          contract: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
          native: true,
        },
        BUSD: { contract: '0xe9e7cea3dedca5984780bafc599bd69add087d56' },
        CAKE: { contract: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82' },
        AXS: { contract: '0x715D400F88C167884bbCc41C5FeA407ed4D2f8A0' },
        DRIP: { contract: '0x20f663CEa80FaCE82ACDFA3aAE6862d246cE0333' },
        AFP: { contract: '0x9a3321E1aCD3B9F6debEE5e042dD2411A1742002' },
        DOGS: {
          contract: '0xDBdC73B95cC0D5e7E99dC95523045Fc8d075Fb9e',
          cmcId: 17965,
        },
        TITANO: { contract: '0x4e3cABD3AD77420FF9031d19899594041C420aeE' },
        MDB: { contract: '0x0557a288A93ed0DF218785F2787dac1cd077F8f3' },
        'MDB+': {
          contract: '0x9f8BB16f49393eeA4331A39B69071759e54e16ea',
          cmcId: 20408,
        },
        SWYCH: { contract: '0x9334e37faD7c41Cd6C9565Bff3A97CE31CEE52a3' },
      },
      polygon: {
        SPHERE: {
          contract: '0x62f594339830b90ae4c084ae7d223ffafd9658a7',
          cmcId: 18945,
        },
        KLIMA: { contract: '0x4e78011Ce80ee02d2c3e649Fb657E45898257815' },
      },
    },
  },
};

export default config;
