import hodlService from './hodl';
import defiService from './defi';
import defi2Service from './defi2';
import backedService from './backed';
import binanceBufferService from './binanceBuffer';
import { CryptoAsset } from '../../../types';

export const portfolioTypes = [
  'hodl',
  'defi',
  'defi2',
  'backed',
  'binanceBuffer',
] as const;

// TODO rename to PortflioType?
export type PortfolioTypes = (typeof portfolioTypes)[number];

const getServiceByPortfolioType = (portfolioType: PortfolioTypes) => {
  switch (portfolioType) {
    case 'hodl':
      return hodlService;

    case 'defi':
      return defiService;

    case 'defi2':
      return defi2Service;

    case 'backed':
      return backedService;

    case 'binanceBuffer':
      return binanceBufferService;

    default:
      throw new Error('Invalid portfolio type.');
  }
};

const getBalance = async (portfolioType: PortfolioTypes) => {
  const service = getServiceByPortfolioType(portfolioType);
  return await service.getBalance();
};

const getAssetPosition = async (portfolioType: PortfolioTypes) => {
  const service = getServiceByPortfolioType(portfolioType);
  return service.getTotalPosition();
};

const getTotalPosition = async () => {
  const totals = await Promise.all(
    portfolioTypes.map(async type => {
      const service = getServiceByPortfolioType(type);
      return await service.getTotalPosition();
    })
  );

  return totals.reduce((obj, current, index) => {
    obj[portfolioTypes[index]] = current;
    return obj;
  }, {});
};

const getPosition = async ({
  type,
  asset,
}: {
  type: PortfolioTypes;
  asset: string;
}) => {
  const service = getServiceByPortfolioType(type);
  return await service.getTotalPosition(asset);
};

const setAssetValue = async ({
  asset,
  value,
}: {
  asset?: string;
  value: number;
}) => {
  asset = asset ? asset : 'binanceBuffer';

  if (asset !== 'binanceBuffer') {
    return { status: 'cannotSetValue' };
  }

  return await binanceBufferService.setAssetValue({ value });
};

const deposit = async ({
  asset,
  value,
}: {
  asset?: CryptoAsset;
  value: number;
}) => {
  asset = asset ? asset : 'binanceBuffer';

  if (asset !== 'binanceBuffer') {
    return { status: 'cannotDepositValue' };
  }

  const service = getServiceByPortfolioType(asset);
  return await service.deposit({ value });
};

const sell = async ({
  portfolioType,
  asset,
  amount,
  orderValue,
}: {
  portfolioType: PortfolioTypes;
  asset: string;
  amount: number;
  orderValue: number;
}) => {
  const service = getServiceByPortfolioType(portfolioType);
  return await service.sell({ asset, amount, orderValue });
};

const getHistory = async (portfolioType: PortfolioTypes) => {
  const service = getServiceByPortfolioType(portfolioType);
  return service.getHistory();
};

export default {
  getBalance,
  getAssetPosition,
  getTotalPosition,
  getPosition,
  setAssetValue,
  deposit,
  sell,
  getHistory,
};
