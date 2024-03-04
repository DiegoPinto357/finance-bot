import { z } from 'zod';
import deposit from './deposit';
import { getPortfolioPositionOnAsset } from './common';
import {
  positiveCurrencySchema,
  portfolioSchema,
  assetSchema,
} from '../../../schemas';

export const transferSchema = z.object({
  value: z.union([positiveCurrencySchema, z.literal('all')]),
  portfolio: portfolioSchema,
  origin: assetSchema,
  destiny: assetSchema,
});

export default async ({
  value,
  portfolio,
  origin,
  destiny,
}: z.infer<typeof transferSchema>) => {
  const currentOriginValue = await getPortfolioPositionOnAsset(
    portfolio,
    origin
  );

  const transferValue = value === 'all' ? currentOriginValue : value;

  const { status: originDepositStatus } = await deposit({
    value: -transferValue,
    portfolio,
    assetClass: origin.class,
    assetName: origin.name,
  });

  if (originDepositStatus !== 'ok') return { status: originDepositStatus };

  const { status: destinyDepositStatus } = await deposit({
    value: transferValue,
    portfolio,
    assetClass: destiny.class,
    assetName: destiny.name,
  });

  if (destinyDepositStatus !== 'ok') return { status: destinyDepositStatus };

  return { status: 'ok' };
};
