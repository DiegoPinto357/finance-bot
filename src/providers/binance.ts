import crypto from 'crypto';
import { withCache } from '../libs/cache';
import { buildLogger } from '../libs/logger';
import httpClient from '../libs/httpClient';

const log = buildLogger('Binance');

// needs to check on Binance which assets don't support BRL anymore
const assetsWithBridge = ['ATOM', 'S', 'RUNE', 'USDC', 'VET'];

const host = 'https://api.binance.com';

const headersWithApiKey = {
  'Content-Type': 'application/json',
  'X-MBX-APIKEY': process.env.BINANCE_API_KEY,
};

const getCached = withCache(httpClient.get);

const getQueryParamsWithSignature = () => {
  const timestamp = Date.now().toString();
  const signature = crypto
    .createHmac('sha256', process.env.BINANCE_API_SECRET!)
    .update(`timestamp=${timestamp.toString()}`)
    .digest('hex');
  return `timestamp=${timestamp.toString()}&signature=${signature}`;
};

type AccountInfo = {
  balances: { asset: string; free: string; locked: string }[];
};

const getAccountInformation = async () => {
  log('Loading account information');
  const queryString = getQueryParamsWithSignature();
  const url = `${host}/api/v3/account?${queryString}`;
  return await getCached<AccountInfo>(url, { headers: headersWithApiKey });
};

type FlexiblePosition = {
  rows: { asset: string; totalAmount: string }[];
};

const getFlexibleEarnPosition = async () => {
  log('Loading flexible earn position');
  const queryString = getQueryParamsWithSignature();
  const url = `${host}/sapi/v1/simple-earn/flexible/position?${queryString}`;
  const { rows } = await getCached<FlexiblePosition>(url, {
    headers: headersWithApiKey,
  });
  return rows;
};

type LockedPosition = {
  rows: { asset: string; amount: string }[];
};

const getLockedEarnPosition = async () => {
  log('Loading locked earn position');
  const queryString = getQueryParamsWithSignature();
  const url = `${host}/sapi/v1/simple-earn/locked/position?${queryString}`;
  const { rows } = await getCached<LockedPosition>(url, {
    headers: headersWithApiKey,
  });
  return rows;
};

type SymbolPrice = {
  symbol: string;
  price: string;
};

const getSymbolPrice = async (symbol: string) => {
  log(`Loading price ticker for ${symbol}`);
  const params = new URLSearchParams({ symbol });
  const url = `${host}/api/v3/ticker/price?${params}`;
  const data = await getCached<SymbolPrice>(url);
  return +data.price;
};

const getAssetPriceWithBridge = async (
  symbol: string,
  bridgeAsset: string,
  asset: string,
  targetAsset: string
) => {
  log(`Symbol ${symbol} not available. Using ${bridgeAsset} token as bridge.`);
  const bridgePrice = await getSymbolPrice(`${asset}${bridgeAsset}`);
  return (await getSymbolPrice(`${bridgeAsset}${targetAsset}`)) * bridgePrice;
};

const getAssetPrice = async ({
  asset,
  targetAsset,
  bridgeAsset,
}: {
  asset: string;
  targetAsset: string;
  bridgeAsset: string;
}) => {
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

const processEarnData = (
  rawData: (
    | { asset: string; totalAmount: string }
    | { asset: string; amount: string }
  )[]
) =>
  rawData.reduce((prev, current) => {
    if (!current) return prev;
    const { asset } = current;
    const existingAsset = prev.find(item => item.asset === current.asset);
    const amount = parseFloat(
      'amount' in current ? current.amount : current.totalAmount
    );

    if (existingAsset) {
      existingAsset.amount = existingAsset.amount + amount;
    } else {
      prev.push({ asset, amount });
    }
    return prev;
  }, [] as { asset: string; amount: number }[]);

const getEarnPosition = async () => {
  log('Loading staking account info');
  const [lockedSavings, flexibleSavings] = await Promise.all([
    getLockedEarnPosition(),
    getFlexibleEarnPosition(),
  ]);

  const locked = processEarnData(lockedSavings);
  const flexible = processEarnData(flexibleSavings);

  return [...locked, ...flexible];
};

export default {
  getAccountInformation,
  getAssetPrice,
  getEarnPosition,
};
