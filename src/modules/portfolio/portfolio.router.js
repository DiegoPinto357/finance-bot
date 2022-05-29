import express from 'express';
import portfolioService from './portfolio.service';

const router = express.Router();

router.get('/api/portfolio/balance', async (_req, res) =>
  res.json(await portfolioService.getBalance())
);

router.get('/api/portfolio/balance/:portfolioName', async (req, res) =>
  res.json(await portfolioService.getBalance(req.params.portfolioName))
);

router.get('/api/portfolio/shares/:portfolioName', async (req, res) =>
  res.json(await portfolioService.getShares(req.params.portfolioName))
);

router.post('/api/portfolio/deposit', async (req, res) =>
  res.json(await portfolioService.deposit(req.body))
);

export default router;
