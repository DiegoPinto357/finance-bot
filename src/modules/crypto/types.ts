export type CryptoNetwork = 'bsc' | 'polygon' | 'avalanche';

export type AssetData = {
  asset: string;
  location: string;
  type: string;
  amount?: number;
  score?: number;
};
