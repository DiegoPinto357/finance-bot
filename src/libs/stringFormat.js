export const formatPercentage = value =>
  typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : undefined;

export const formatCurrency = value =>
  typeof value === 'number' ? `R$${value.toFixed(2)}` : undefined;
