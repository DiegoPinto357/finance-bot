import { formatTable } from '../../libs/cliFormat';
import { formatCurrency, formatPercentage } from '../../libs/stringFormat';

export const printBalance = (name, balance, balanceTotal) => {
  if (!name) {
    console.log(JSON.stringify(balance, null, 2));
    console.log(balanceTotal);
    return;
  }

  const flatBalance = [
    ...balance.fixed.balance,
    ...balance.stock.balance,
    ...balance.crypto.balance,
  ];

  console.table(flatBalance);
  console.log({ balanceTotal });
};

export const printLiquidity = (portfolioName, liquidityData) => {
  if (portfolioName) {
    console.table(liquidityData);
    return;
  }

  console.table(
    formatTable(liquidityData, [
      null,
      formatCurrency,
      formatPercentage,
      formatCurrency,
    ])
  );
};
