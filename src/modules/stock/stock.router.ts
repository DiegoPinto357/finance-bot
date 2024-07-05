import express from 'express';
import stockService from './stock.service';

import type { Request, Response } from 'express';

const router = express.Router();

router.get('/api/stock/total-position', async (_req: Request, res: Response) =>
  res.json(await stockService.getTotalPosition())
);

export default router;
