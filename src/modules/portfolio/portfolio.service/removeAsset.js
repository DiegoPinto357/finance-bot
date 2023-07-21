import { buildLogger } from '../../../libs/logger';
import database from '../../../providers/database';
import { services } from './common';

const log = buildLogger('Portfolios');

export default async ({ assetClass, assetName }) => {
  if (assetClass !== 'fixed') {
    log(`removeAsset not implemented for ${assetClass} assets`, {
      severity: 'error',
    });
  }

  const service = services[assetClass];
  const { status } = await service.removeAsset(assetName);

  if (status !== 'ok') {
    return { status };
  }

  await database.deleteOne('portfolio', 'shares', {
    assetClass,
    assetName,
  });

  return { status: 'ok' };
};
