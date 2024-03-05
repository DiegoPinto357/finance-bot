import express from 'express';
import { z } from 'zod';
import validateSchema from '../../server/validateSchema';
import portfolioService, {
  transferSchema,
  swapSchema,
} from './portfolio.service';

import type { Request, Response } from 'express';
import type { PortfolioName } from './portfolio.service';

const router = express.Router();

router.get('/api/portfolio/balance', async (_req: Request, res: Response) =>
  res.json(await portfolioService.getBalance())
);

router.get(
  '/api/portfolio/balance/:portfolioName',
  async (req: Request<{ portfolioName: PortfolioName }>, res: Response) =>
    res.json(await portfolioService.getBalance(req.params.portfolioName))
);

router.get(
  '/api/portfolio/shares/:portfolioName',
  async (req: Request<{ portfolioName: PortfolioName }>, res: Response) =>
    res.json(await portfolioService.getShares(req.params.portfolioName))
);

router.get('/api/portfolio/assets', async (_req: Request, res: Response) =>
  res.json(await portfolioService.getAssets())
);

router.post('/api/portfolio/deposit', async (req: Request, res: Response) =>
  res.json(await portfolioService.deposit(req.body))
);

router.post(
  '/api/portfolio/transfer',
  validateSchema(z.object({ body: transferSchema })),
  async (req: Request, res: Response) =>
    res.json(await portfolioService.transfer(req.body))
);

router.post(
  '/api/portfolio/swap',
  validateSchema(z.object({ body: swapSchema })),
  async (req: Request, res: Response) =>
    res.json(await portfolioService.swap(req.body))
);

export default router;
