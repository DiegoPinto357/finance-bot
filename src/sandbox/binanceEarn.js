import 'dotenv/config';
import { Spot } from '@binance/connector';

const client = new Spot(
  process.env.BINANCE_API_KEY,
  process.env.BINANCE_API_SECRET
);

(async () => {
  try {
    const { data: stakingData } = await client.stakingProductPosition(
      'STAKING'
    );
    const staking = stakingData.reduce((prev, current) => {
      const { asset, amount } = current;
      const existingAsset = prev.find(item => item.asset === asset);
      if (existingAsset) {
        existingAsset.amount = existingAsset.amount + parseFloat(amount);
      } else {
        prev.push({ asset, amount: parseFloat(amount) });
      }
      return prev;
    }, []);

    const { data: savingsAccount } = await client.savingsAccount();
    const savingsAssets = savingsAccount.positionAmountVos.map(
      ({ asset }) => asset
    );

    const responses = await Promise.all(
      savingsAssets.map(asset => client.savingsFlexibleProductPosition(asset))
    );
    const savingsData = responses.map(({ data }) => data);
    const savings = savingsData.reduce((prev, [current]) => {
      if (!current) return prev;
      const { asset, totalAmount: amount } = current;
      const existingAsset = prev.find(item => item.asset === asset);
      if (existingAsset) {
        existingAsset.amount = existingAsset.amount + parseFloat(amount);
      } else {
        prev.push({ asset, amount: parseFloat(amount) });
      }
      return prev;
    }, []);
    console.log('===========================');
    console.log(staking, savings);
  } catch (error) {
    console.log(error);
  }
})();
