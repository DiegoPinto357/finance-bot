const copiedFromMongodb = {
  _id: {
    $oid: '6300f50023dcd7cddab9b0bd',
  },
  assetClass: 'fixed',
  assetName: 'nubank',
  shares: [
    {
      portfolio: 'temp',
      value: 0,
    },
    {
      portfolio: 'amortecedor',
      value: 0.04280114551560713,
    },
    {
      portfolio: 'financiamento',
      value: 0.0006764273861335749,
    },
    {
      portfolio: 'viagem',
      value: 0,
    },
    {
      portfolio: 'reformaCasa',
      value: 0.6634647045964409,
    },
    {
      portfolio: 'previdencia',
      value: 0,
    },
    {
      portfolio: 'leni',
      value: 0.009714298889876355,
    },
    {
      portfolio: 'mae',
      value: 0.09777708327937343,
    },
    {
      portfolio: 'seguroCarro',
      value: 0.008239398963386702,
    },
    {
      portfolio: 'manutencaoCarro',
      value: 0.045401923248577426,
    },
    {
      portfolio: 'impostos',
      value: 0.0164727181866184,
    },
    {
      portfolio: 'suricat',
      value: 0.08143609279611325,
    },
    {
      portfolio: 'congelamentoSuricats',
      value: 0.02041103875368772,
    },
    {
      portfolio: 'carro',
      value: 0.001931781140359501,
    },
    {
      portfolio: 'macbookFirma',
      value: 0.000152218679436184,
    },
    {
      portfolio: 'rendaPassiva',
      value: 0.00021076432537317784,
    },
  ],
};

const totalShares = copiedFromMongodb.shares.reduce(
  (total, { value }) => total + value,
  0
);

console.log({ totalShares });
console.log({ fix: 1 - totalShares });
