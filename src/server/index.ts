#!/usr/bin/env node
import 'dotenv/config';
import 'express-async-errors';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import core from '../core.js';
import { buildLogger } from '../libs/logger.js';
import systemRouter from '../modules/system/system.router';
import fixedRouter from '../modules/fixed/fixed.router';
import stockRouter from '../modules/stock/stock.router';
import cryptoRouter from '../modules/crypto/crypto.router';
import portfolioRouter from '../modules/portfolio/portfolio.router';
import mcpRouter from './mcp/mcp.router.js';
import { initializeBackupScheduler } from './backupScheduler.js';

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const log = buildLogger('HTTP Server');

app.use(express.json());
app.use(cors());

app.all('*', (req, _res, next) => {
  log(`Request at "${req.originalUrl}"`);
  next();
});

app.use(systemRouter);
app.use(fixedRouter);
app.use(stockRouter);
app.use(cryptoRouter);
app.use(portfolioRouter);
app.use(mcpRouter);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message });
});

(async () => {
  try {
    await core.init();
    initializeBackupScheduler();
    app.listen(port, () => log(`Finance Bot listening on port ${port}`));
  } catch (error) {
    console.error('Error initializing server:', error);
  }
})();
