import getBalance from './getBalance';
import { flatPortfolioBalance } from './common';
import getPortfolios from './getPortfolios';
import { Portfolio } from '../../../types';
import {
  AssetBalanceWithClass,
  BalanceByAssetWithTotal,
  BalanceByPortfolioWithTotal,
} from './types';

const getPortfolioLiquidity = async (
  portfolioName: Portfolio,
  { balance, total }: BalanceByAssetWithTotal
) => {
  // TODO remove typecast when flatPortfolioBalance return type is defined
  const balanceFlat = <AssetBalanceWithClass[]>flatPortfolioBalance(balance);
  const liquidValue = balanceFlat.reduce(
    (total, assetBalance) =>
      assetBalance.liquidity ? total + assetBalance.value : total,
    0
  );

  const liquidRatio = total !== 0 ? liquidValue / total : 0;

  return {
    portfolio: portfolioName,
    liquidValue,
    liquidRatio,
    totalValue: total,
  };
};

export default async (portfolioName?: Portfolio) => {
  if (portfolioName) {
    const balance = await (<Promise<BalanceByAssetWithTotal>>(
      getBalance(portfolioName)
    ));
    return await getPortfolioLiquidity(portfolioName, balance);
  }

  const { balance, total } = await (<Promise<BalanceByPortfolioWithTotal>>(
    getBalance()
  ));

  // TODO remove type cast as getPortfolios type is defined
  const portfolios = await (<Promise<Portfolio[]>>getPortfolios());

  const liquidityData = await Promise.all(
    portfolios.map(portfolio =>
      getPortfolioLiquidity(portfolio, balance[portfolio])
    )
  );

  const totalLiquidValue = liquidityData.reduce(
    (total, { liquidValue }) => total + liquidValue,
    0
  );

  const totalRow = {
    portfolio: 'total',
    liquidValue: totalLiquidValue,
    liquidRatio: total !== 0 ? totalLiquidValue / total : 0,
    totalValue: total,
  };

  return [
    ...liquidityData.sort((a, b) => a.liquidRatio - b.liquidRatio),
    totalRow,
  ];
};
