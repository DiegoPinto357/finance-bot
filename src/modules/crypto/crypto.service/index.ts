import hodlService from './hodl';
import defiService from './defi';
import defi2Service from './defi2';
import backedService from './backed';
import binanceBufferService from './binanceBuffer';
import { getFlags } from '../../system/system.service';

import type { CryptoAsset } from '../../../schemas';

export const portfolioTypes = [
  'hodl',
  'defi',
  'defi2',
  'backed',
  'binanceBuffer',
] as const;

// TODO rename to PortflioType?
export type PortfolioTypes = (typeof portfolioTypes)[number];

type Service<T> = T extends 'hodl'
  ? typeof hodlService
  : T extends 'defi'
  ? typeof defiService
  : T extends 'defi2'
  ? typeof defi2Service
  : T extends 'backed'
  ? typeof backedService
  : T extends 'binanceBuffer'
  ? typeof binanceBufferService
  : never;

const services: Record<PortfolioTypes, Service<PortfolioTypes>> = {
  hodl: hodlService,
  defi: defiService,
  defi2: defi2Service,
  backed: backedService,
  binanceBuffer: binanceBufferService,
};

const getBalance = async <T extends PortfolioTypes>(portfolioType: T) => {
  const service = services[portfolioType];
  return (await service.getBalance()) as unknown as ReturnType<
    Service<T>['getBalance']
  >;
};

const getAssetPosition = async (portfolioType: PortfolioTypes) => {
  const service = services[portfolioType];
  return service.getTotalPosition();
};

const getTotalPosition = async () => {
  const { cryptoDefiEnabled } = getFlags();
  const filteredPortfolioTypes = portfolioTypes.filter(type => {
    if (!cryptoDefiEnabled) {
      return type !== 'defi' && type !== 'defi2';
    }
    return true;
  });

  const totals = await Promise.all(
    filteredPortfolioTypes.map(async type => {
      const service = services[type];
      return await service.getTotalPosition();
    })
  );

  return totals.reduce((obj, current, index) => {
    obj[filteredPortfolioTypes[index]] = current;
    return obj;
  }, {} as Record<PortfolioTypes | 'total', number>);
};

const getPosition = async ({
  type,
  asset,
}: {
  type: PortfolioTypes;
  asset: string;
}) => {
  const service = services[type];
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

  const service = services[asset];
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
  const service = services[portfolioType];
  return await service.sell({ asset, amount, orderValue });
};

const getHistory = async (portfolioType: PortfolioTypes) => {
  const service = services[portfolioType];
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
