import portfolioService from './portfolio.service';

const deposit = async args => {
  const { v, portfolio, asset } = args;
  console.log({ v, portfolio, asset });

  const assetSplitted = asset.split('.');
  const assetClass = assetSplitted[0];
  const assetName = assetSplitted[1];

  const response = await portfolioService.deposit({
    value: v,
    portfolio,
    assetClass,
    assetName,
  });
  console.log(response);
};

const transfer = async args => {
  const { v, portfolio, from, to } = args;
  console.log({ v, portfolio, from, to });

  const originItems = from.split('.');
  const origin = { class: originItems[0], name: originItems[1] };

  const destinyItems = to.split('.');
  const destiny = { class: destinyItems[0], name: destinyItems[1] };

  console.log({ origin, destiny });

  const response = await portfolioService.transfer(v, {
    portfolio,
    origin,
    destiny,
  });
  console.log(response);
};

export default async (command, args) => {
  const { name } = args;

  switch (command) {
    case 'balance':
      const { balance, total: balanceTotal } =
        await portfolioService.getBalance(name);

      if (!name) {
        console.log(JSON.stringify(balance, null, 2));
        console.log(balanceTotal);
        break;
      }

      const flatBalance = [
        ...balance.fixed.balance,
        ...balance.stock.balance,
        ...balance.crypto.balance,
      ];

      console.table(flatBalance);
      console.log({ balanceTotal });
      break;

    case 'shares':
      const { shares, total } = await portfolioService.getShares(name);

      console.table(shares);
      console.log({ total });
      break;

    case 'total':
      console.error('Invalid command');
      break;

    case 'deposit':
      await deposit(args);
      break;

    case 'transfer':
      await transfer(args);
      break;

    // TODO refactor this shit
    case 'swap':
      const { v, portfolio, asset, from, to, l } = args;
      console.log({ portfolio, asset, from, to, l });

      const originItems = from.split('.');
      const origin =
        originItems.length === 1
          ? from
          : { class: originItems[0], name: originItems[1] };

      const destinyItems = to.split('.');
      const destiny =
        destinyItems.length === 1
          ? to
          : { class: destinyItems[0], name: destinyItems[1] };

      const assetItems = asset ? asset.split('.') : [];
      const assetObj = asset
        ? { class: assetItems[0], name: assetItems[1] }
        : undefined;

      const liquidityItems = l.split('.');
      const liquidity =
        liquidityItems.length === 1
          ? l
          : { class: liquidityItems[0], name: liquidityItems[1] };

      console.log({ assetObj, origin, destiny });

      const response = await portfolioService.swap(v, {
        portfolio,
        asset: assetObj,
        origin,
        destiny,
        liquidity,
      });
      console.log(response);
      break;

    case 'update-table':
      await portfolioService.updateAbsoluteTable();
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
