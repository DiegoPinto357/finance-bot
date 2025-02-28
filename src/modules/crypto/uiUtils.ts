import _ from 'lodash';
import {
  formatCurrency,
  formatPercentage,
  formatPrecision,
} from '../../libs/stringFormat';
import { formatTable } from '../../libs/cliFormat';

import type { PortfolioTypes } from './crypto.service';

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

export const formatBalance = (type: PortfolioTypes, balance: object[]) => {
  const formatter = getBalanceFormatter(type);
  return formatTable(
    balance.map(item => _.omit(item, 'network')),
    formatter
  );
};
