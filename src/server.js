#!/usr/bin/env node
import 'dotenv/config';
import 'express-async-errors';
import express from 'express';
import { buildLogger } from './libs/logger';
import cryptoRouter from './modules/crypto/crypto.router';
import portfolioRouter from './modules/portfolio/portfolio.router';

const app = express();
const port = 3001;

const log = buildLogger('HTTP Server');

app.use(express.json());

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

app.listen(port, () => log(`Finance Bot listening on port ${port}`));
