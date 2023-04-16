#!/usr/bin/env node
require('dotenv/config');
require('express-async-errors');
const express = require('express');
const cors = require('cors');
const core = require('./core');
const { buildLogger } = require('./libs/logger');
const cryptoRouter = require('./modules/crypto/crypto.router');
const portfolioRouter = require('./modules/portfolio/portfolio.router');

const app = express();
const port = 3001;

const log = buildLogger('HTTP Server');

app.use(express.json());
app.use(cors());

app.all('*', (req, _res, next) => {
  log(`Request at "${req.originalUrl}"`);
  next();
});

app.use(cryptoRouter);
app.use(portfolioRouter);

app.use((err, _req, res, _next) => {
  log(err.stack);
  res.status(500).json({ error: err });
});

(async () => {
  await core.init();

  app.listen(port, () => log(`Finance Bot listening on port ${port}`));
})();
