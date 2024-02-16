import express from 'express';
import portfolioService, { PortfolioName } from './portfolio.service';

import type { Request, Response } from 'express';

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

router.post('/api/portfolio/transfer', async (req: Request, res: Response) => {
  // return res.json(await portfolioService.transfer(req.body));
  console.log('/api/portfolio/transfer');
  console.log(req.body);
  res.send();
});

export default router;
