import express from 'express';
import { z } from 'zod';
import validateSchema from '../../server/validateSchema';
import portfolioService, {
  transferSchema,
  swapSchema,
} from './portfolio.service';

import type { Request, Response } from 'express';
import type { Portfolio } from '../../schemas';

const router = express.Router();

router.get('/api/portfolio/balance', async (_req: Request, res: Response) =>
  res.json(await portfolioService.getBalance())
);

router.get(
  '/api/portfolio/balance/:portfolioName',
  async (req: Request<{ portfolioName: Portfolio }>, res: Response) =>
    res.json(await portfolioService.getBalance(req.params.portfolioName))
);

router.get('/api/portfolio/shares', async (req: Request, res: Response) =>
  res.json(await portfolioService.getShares())
);

router.get(
  '/api/portfolio/shares/:portfolioName',
  async (req: Request<{ portfolioName: Portfolio }>, res: Response) =>
    res.json(await portfolioService.getShares(req.params.portfolioName))
);

router.get('/api/portfolio/assets', async (_req: Request, res: Response) =>
  res.json(await portfolioService.getAssets())
);

router.get('/api/portfolio/history', async (_req: Request, res: Response) =>
  res.json(await portfolioService.getHistory())
);

router.post(
  '/api/portfolio/history',
  validateSchema(),
  async (_req: Request, res: Response) =>
    res.json(await portfolioService.setHistory())
);

// TODO add validation schema
router.post('/api/portfolio/deposit', async (req: Request, res: Response) =>
  res.json(await portfolioService.deposit(req.body))
);

router.post(
  '/api/portfolio/transfer',
  validateSchema({ body: transferSchema }),
  async (req: Request<{}, z.infer<typeof transferSchema>>, res: Response) =>
    res.json(await portfolioService.transfer(req.body))
);

router.post(
  '/api/portfolio/swap',
  validateSchema({ body: swapSchema }),
  async (req: Request<{}, z.infer<typeof swapSchema>>, res: Response) =>
    res.json(await portfolioService.swap(req.body))
);

export default router;
