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
