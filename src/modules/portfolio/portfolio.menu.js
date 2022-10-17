import inquirer from 'inquirer';
import portfolioService from './portfolio.service';

const methods = Object.keys(portfolioService);

const getBalanceMenu = async () => {
  const { portfolioName } = await inquirer.prompt([
    {
      type: 'list',
      name: 'portfolioName',
      message: 'portfolioName?',
      // TODO get assets list from service
      choices: [
        'all',
        'temp',
        'amortecedor',
        'financiamento',
        'viagem',
        'reformaCasa',
        'previdencia',
        'leni',
        'mae',
        'seguroCarro',
        'manutencaoCarro',
        'impostos',
        'suricat',
        'congelamentoSuricats',
        'carro',
        'macbookFirma',
        'rendaPassiva',
      ],
    },
  ]);

  // TODO duplication from portfolio.cli
  const name = portfolioName !== 'all' ? portfolioName : undefined;

  const { balance, total: balanceTotal } = await portfolioService.getBalance(
    name
  );

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

export default async () => {
  const { method } = await inquirer.prompt([
    {
      type: 'list',
      name: 'method',
      message: 'Which method?',
      choices: methods,
    },
  ]);

  switch (method) {
    case 'getBalance':
      await getBalanceMenu();

    default:
  }
};
