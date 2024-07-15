import express from 'express';
import cryptoService, { PortfolioTypes } from './crypto.service';

import type { Request, Response } from 'express';

const router = express.Router();

// TODO add validation schema

router.get(
  '/api/crypto/balance/:type',
  async (req: Request<{ type: PortfolioTypes }>, res: Response) =>
    res.json(await cryptoService.getBalance(req.params.type))
);

router.get('/api/crypto/total', async (_req: Request, res: Response) =>
  res.json(await cryptoService.getTotalPosition())
);

router.get(
  '/api/crypto/history/:type',
  async (req: Request<{ type: PortfolioTypes }>, res: Response) =>
    res.json(await cryptoService.getHistory(req.params.type))
);

export default router;
