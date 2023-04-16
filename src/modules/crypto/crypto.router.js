const express = require('express');
const cryptoService = require('./crypto.service');

const router = express.Router();

router.get('/api/crypto/balance/:type', async (req, res) =>
  res.json(await cryptoService.getBalance(req.params.type))
);

router.get('/api/crypto/total/:type', async (req, res) =>
  res.json(await cryptoService.getTotalPosition(req.params.type))
);

router.get('/api/crypto/history/:type', async (req, res) =>
  res.json(await cryptoService.getHistory(req.params.type))
);

module.exports = router;
