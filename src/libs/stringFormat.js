const formatPercentage = value =>
  typeof value === 'number' ? `${(value * 100).toFixed(2)}%` : undefined;

const formatCurrency = value => {
  if (typeof value !== 'number') return;

  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const fromCurrencyToNumber = value =>
  value !== ''
    ? parseFloat(value.replace('R$', '').replace('.', '').replace(',', '.'))
    : 0;

module.exports = {
  formatPercentage,
  formatCurrency,
  fromCurrencyToNumber,
};
