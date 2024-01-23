import _ from 'lodash';
import {
  formatCurrency,
  formatPercentage,
  formatPrecision,
} from '../../libs/stringFormat';
import { formatTable } from '../../libs/cliFormat';

import type { PortfolioTypes } from './crypto.service';
import type { CryptoNetwork } from './types';

const getBalanceFormatter = (type: PortfolioTypes) => {
  switch (type) {
    case 'hodl':
      return [
        null,
        formatPrecision,
        formatPrecision,
        formatPrecision,
        null,
        formatCurrency,
        formatCurrency,
        formatPercentage,
        formatPercentage,
        formatPercentage,
        formatCurrency,
        formatPrecision,
      ];

    case 'defi':
    case 'defi2':
      return [
        null,
        null,
        null,
        formatCurrency,
        formatPrecision,
        formatPrecision,
        formatPercentage,
        formatPercentage,
        null,
        formatCurrency,
        formatCurrency,
      ];

    default:
      return [];
  }
};

// TODO convert HODL module to TS and use proper types
type BalanceItem = {
  asset: string;
  spot: number;
  earn: number;
  total: number;
  portfolioScore: number;
  priceBRL: number;
  positionBRL: number;
  positionTarget: number;
  position: number;
  positionDiff: number;
  diffBRL: number;
  diffTokens: number;
  network?: CryptoNetwork;
};

export const formatBalance = (type: PortfolioTypes, balance: BalanceItem[]) => {
  const formatter = getBalanceFormatter(type);
  return formatTable(
    balance.map(item => _.omit(item, 'network')),
    formatter
  );
};
