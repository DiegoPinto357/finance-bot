import express from 'express';
import { z } from 'zod';
import validateSchema from '../../server/validateSchema';
import fixedService from './fixed.service';

import type { Request, Response } from 'express';
import type { FixedAsset, FixedAssetBalance } from '../../types';

const router = express.Router();

const getBalanceSchema = z.object({
  query: z.object({
    assetName: z.union([z.string(), z.string().array()]).optional(),
  }),
});

router.get(
  '/api/fixed/balance',
  validateSchema(getBalanceSchema),
  async (
    req: Request<
      {},
      {},
      {},
      { assetName: FixedAsset | FixedAsset[] | undefined } // GetBalanceQuery
    >,
    res: Response
  ) => {
    res.json(await fixedService.getBalance(req.query.assetName));
  }
);

const setAssetValueSchema = z.object({
  body: z.object({
    asset: z.string(),
    value: z.coerce.number(),
  }),
});

router.post(
  '/api/fixed/asset-value',
  validateSchema(setAssetValueSchema),
  async (
    req: Request<{}, {}, Omit<FixedAssetBalance, 'liquidity'>>,
    res: Response
  ) => {
    console.log('/api/fixed/asset-value');
    console.log(req.body);
    res.send();
  }
);

export default router;
