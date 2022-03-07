export const formatPercentage = value =>
  typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : undefined;

export const formatCurrency = value => {
  if (typeof value !== 'number') return;
  return value < 0
    ? `-R$${Math.abs(value).toFixed(2)}`
    : `R$${value.toFixed(2)}`;
};
