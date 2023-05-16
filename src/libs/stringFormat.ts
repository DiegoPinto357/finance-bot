export const formatPercentage = (value: number) =>
  typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : undefined;

export const formatCurrency = (value: number) => {
  if (typeof value !== 'number') return;

  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

export const fromCurrencyToNumber = (value: string) =>
  value !== ''
    ? parseFloat(value.replace('R$', '').replace('.', '').replace(',', '.'))
    : 0;
