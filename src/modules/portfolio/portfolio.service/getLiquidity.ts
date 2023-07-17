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
  const liquidityValue = balanceFlat.reduce(
    (total, assetBalance) =>
      assetBalance.liquidity ? total + assetBalance.value : total,
    0
  );

  const liquidityRatio = total !== 0 ? liquidityValue / total : 0;

  return {
    portfolio: portfolioName,
    liquidityValue,
    liquidityRatio,
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

  const totalliquidityValue = liquidityData.reduce(
    (total, { liquidityValue }) => total + liquidityValue,
    0
  );

  const totalRow = {
    portfolio: 'total',
    liquidityValue: totalliquidityValue,
    liquidityRatio: total !== 0 ? totalliquidityValue / total : 0,
    totalValue: total,
  };

  return [
    ...liquidityData.sort((a, b) => a.liquidityRatio - b.liquidityRatio),
    totalRow,
  ];
};
