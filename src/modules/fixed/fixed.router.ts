import express from 'express';
import { z } from 'zod';
import validateSchema from '../../server/validateSchema';
import fixedService, {
  getBalanceSchema,
  setAssetValueSchema,
} from './fixed.service';

import type { Request, Response } from 'express';

const router = express.Router();

router.get(
  '/api/fixed/balance',
  validateSchema(
    z.object({ query: z.object({ assetName: getBalanceSchema }) })
  ),
  async (
    req: Request<{}, {}, {}, { assetName: z.infer<typeof getBalanceSchema> }>,
    res: Response
  ) => res.json(await fixedService.getBalance(req.query.assetName))
);

router.post(
  '/api/fixed/asset-value',
  validateSchema(z.object({ body: setAssetValueSchema })),
  async (req: Request, res: Response) =>
    res.json(await fixedService.setAssetValue(req.body))
);

export default router;
