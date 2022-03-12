export const formatPercentage = value =>
  typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : undefined;

export const formatCurrency = value => {
  if (typeof value !== 'number') return;

  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
