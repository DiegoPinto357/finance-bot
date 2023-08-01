import database from '../../../providers/database';
import { AssetClass, AssetName } from '../../../types';

interface AssetFromPortfolioDB {
  assetName: AssetName;
  assetClass: AssetClass;
}

export default () =>
  database.find<AssetFromPortfolioDB[]>(
    'portfolio',
    'shares',
    {},
    { projection: { _id: 0, shares: 0 } }
  );
