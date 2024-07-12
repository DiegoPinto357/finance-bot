import express from 'express';
import { z } from 'zod';
import validateSchema from '../../server/validateSchema';
import stockService, { setAssetValueSchema } from './stock.service';

import type { Request, Response } from 'express';

const router = express.Router();

router.get('/api/stock/total-position', async (_req: Request, res: Response) =>
  res.json(await stockService.getTotalPosition())
);

router.post(
  '/api/stock/asset-value',
  validateSchema(z.object({ body: setAssetValueSchema })),
  async (req: Request, res: Response) =>
    res.json(await stockService.setAssetValue(req.body))
);

export default router;
