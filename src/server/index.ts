#!/usr/bin/env node
import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import core from '../core';
import { buildLogger } from '../libs/logger';
import systemRouter from '../modules/system/system.router';
import fixedRouter from '../modules/fixed/fixed.router';
import cryptoRouter from '../modules/crypto/crypto.router';
import portfolioRouter from '../modules/portfolio/portfolio.router';

import type { Request, Response, NextFunction } from 'express';

const app = express();
const port = 3001;

const log = buildLogger('HTTP Server');

app.use(express.json());
app.use(cors());

app.all('*', (req, _res, next) => {
  log(`Request at "${req.originalUrl}"`);
  next();
});

app.use(systemRouter);
app.use(fixedRouter);
app.use(cryptoRouter);
app.use(portfolioRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err });
});

(async () => {
  await core.init();

  app.listen(port, () => log(`Finance Bot listening on port ${port}`));
})();
