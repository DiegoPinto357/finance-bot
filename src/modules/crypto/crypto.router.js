import express from 'express';
import cryptoService from './crypto.service';

const router = express.Router();

router.get('/crypto/balance/:type', async (req, res) =>
  res.json(await cryptoService.getBalance(req.params.type))
);

router.get('/crypto/total/:type', async (req, res) =>
  res.json(await cryptoService.getTotalPosition(req.params.type))
);

router.get('/crypto/history/:type', async (req, res) =>
  res.json(await cryptoService.getHistory(req.params.type))
);

export default router;
