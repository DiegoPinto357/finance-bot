/**
 * @batata true
 */

export default {
  actions: [
    {
      module: 'portfolio',
      method: 'swap',
      params: {
        value: 357,
        portfolio: 'previdencia',
        origin: { class: 'fixed', name: 'nubank' },
        destiny: { class: 'crypto', name: 'hodl' },
        liquidity: 'amortecedor',
      },
    },
  ],
};
