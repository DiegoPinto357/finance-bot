declare module BinanceConnector {
  class Spot {
    constructor(apiKey: string | undefined, apiSecret: string | undefined);

    account(): Promise<{
      data: { balances: { asset: string; free: string; locked: string }[] };
    }>;

    savingsAccount(): Promise<{
      data: { positionAmountVos: { asset: string }[] };
    }>;

    savingsFlexibleProductPosition(symbol: string): Promise<{
      data: { asset: string; totalAmount: string; amount: string }[];
    }>;

    stakingProductPosition(type: string): Promise<{
      data: { asset: string; totalAmount: string; amount: string }[];
    }>;

    tickerPrice(symbol: string): Promise<{ data: { price: string } }>;
  }
}
export = BinanceConnector;
