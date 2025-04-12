import portfolioService from './portfolio.service';
import { printBalance } from './cliUtils';

const proccessAssetInput = input => {
  if (!input) return;
  const items = input.split('.');
  return { class: items[0], name: items[1] };
};

const isComposedAsset = asset => !!asset.match(/\./);

const balance = async args => {
  const { name } = args;

  const { balance, total } = await portfolioService.getBalance(name);
  printBalance(name, balance, total);
};

const shares = async args => {
  const { name } = args;

  const { shares, total } = await portfolioService.getShares(name);

  console.table(shares);
  console.log({ total });
};

const deposit = async args => {
  const { v, portfolio, asset } = args;
  console.log({ v, portfolio, asset });

  const { class: assetClass, name: assetName } = proccessAssetInput(asset);

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

  const origin = proccessAssetInput(from);
  const destiny = proccessAssetInput(to);

  console.log({ origin, destiny });

  const response = await portfolioService.transfer({
    value: v,
    portfolio,
    origin,
    destiny,
  });
  console.log(response);
};

const swap = async args => {
  const { v, portfolio, asset, from, to, l } = args;
  console.log({ portfolio, asset, from, to, l });

  const origin = isComposedAsset(from) ? proccessAssetInput(from) : from;
  const destiny = isComposedAsset(to) ? proccessAssetInput(to) : to;

  const assetObj = proccessAssetInput(asset);

  const liquidity = isComposedAsset(l) ? proccessAssetInput(l) : l;

  console.log({ assetObj, origin, destiny, liquidity });

  const response = await portfolioService.swap({
    value: v,
    portfolio,
    asset: assetObj,
    origin,
    destiny,
    liquidity,
  });
  console.log(response);
};

export default async (command, args) => {
  switch (command) {
    case 'balance':
      await balance(args);
      break;

    case 'shares':
      await shares(args);
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

    case 'swap':
      await swap(args);
      break;

    case 'update-table':
      await portfolioService.updateAbsoluteTable();
      break;

    case 'migrate':
      await portfolioService.migrate();
      break;

    default:
      console.error('Invalid command');
      break;
  }
};
