import { Spot } from '@binance/connector';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';

const log = buildLogger('Binance');

// needs to check on Binance which assets don't support BRL anymore
const assetsWithBridge = ['ATOM'];

const client = new Spot(
  process.env.BINANCE_API_KEY,
  process.env.BINANCE_API_SECRET
);

const getTickerPriceCached = withCache(params => client.tickerPrice(params), {
  dataNode: 'data',
});

const getAccountInformation = async () => {
  log('Loading account information');
  const { data } = await client.account();
  return data;
};

const getSymbolPriceTicker = async ({ symbol }) => {
  log(`Loading price ticker for ${symbol}`);
  const { data } = await getTickerPriceCached(symbol);
  return data;
};

const getSymbolPrice = async symbol =>
  +(await getSymbolPriceTicker({ symbol })).price;

const getAssetPriceWithBridge = async (
  symbol,
  bridgeAsset,
  asset,
  targetAsset
) => {
  log(`Symbol ${symbol} not available. Using ${bridgeAsset} token as bridge.`);
  const bridgePrice = await getSymbolPrice(`${asset}${bridgeAsset}`);
  return (await getSymbolPrice(`${bridgeAsset}${targetAsset}`)) * bridgePrice;
};

const getAssetPrice = async ({ asset, targetAsset, bridgeAsset }) => {
  if (asset === targetAsset) return 1;

  const symbol = `${asset}${targetAsset}`;

  try {
    if (assetsWithBridge.includes(asset)) {
      return await getAssetPriceWithBridge(
        symbol,
        bridgeAsset,
        asset,
        targetAsset
      );
    }

    return await getSymbolPrice(symbol);
  } catch (e) {
    // TODO check error type and re-throw if not related to symbol not found
    return await getAssetPriceWithBridge(
      symbol,
      bridgeAsset,
      asset,
      targetAsset
    );
  }
};

const getSavingsPosition = async () => {
  log('Loading savings account info');
  const { data: savingsAccount } = await client.savingsAccount();
  const savingsAssets = savingsAccount.positionAmountVos.map(
    ({ asset }) => asset
  );

  const responses = await Promise.all(
    savingsAssets.map(async asset => {
      log(`Loading savings position for ${asset}`);
      return client.savingsFlexibleProductPosition(asset);
    })
  );
  return responses.map(({ data }) => data[0]);
};

const processEarnData = rawData =>
  rawData.reduce((prev, current) => {
    if (!current) return prev;
    const { asset, totalAmount, amount } = current;
    const existingAsset = prev.find(item => item.asset === asset);
    if (existingAsset) {
      existingAsset.amount =
        existingAsset.amount + parseFloat(amount || totalAmount);
    } else {
      prev.push({ asset, amount: parseFloat(amount || totalAmount) });
    }
    return prev;
  }, []);

const getEarnPosition = async () => {
  log('Loading staking account info');
  const [{ data: stakingData }, savingsData] = await Promise.all([
    client.stakingProductPosition('STAKING'),
    getSavingsPosition(),
  ]);

  const staking = processEarnData(stakingData);
  const savings = processEarnData(savingsData);

  return [...staking, ...savings];
};

export default {
  getAccountInformation,
  getSymbolPriceTicker,
  getAssetPrice,
  getEarnPosition,
};
