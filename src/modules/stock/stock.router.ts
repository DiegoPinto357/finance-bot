import express from 'express';
import { z } from 'zod';
import validateSchema from '../../server/validateSchema';
import stockService, {
  getAssetPositionSchema,
  setAssetValueSchema,
} from './stock.service';

import type { Request, Response } from 'express';

const router = express.Router();

router.get(
  '/api/stock/asset-position',
  validateSchema({ query: getAssetPositionSchema }),
  async (
    req: Request<{}, {}, {}, z.infer<typeof getAssetPositionSchema>>,
    res: Response
  ) => res.json(await stockService.getAssetPosition(req.query.assetType))
);

router.get('/api/stock/total-position', async (_req: Request, res: Response) =>
  res.json(await stockService.getTotalPosition())
);

router.post(
  '/api/stock/asset-value',
  validateSchema({ body: setAssetValueSchema }),
  async (req: Request, res: Response) =>
    res.json(await stockService.setAssetValue(req.body))
);

export default router;
