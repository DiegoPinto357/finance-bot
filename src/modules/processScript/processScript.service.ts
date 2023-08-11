import _ from 'lodash';
import { buildLogger } from '../../libs/logger';
import fixedService from '../fixed/fixed.service';
import stockService from '../stock/stock.service';
import cryptoService from '../crypto/crypto.service';
import portfolioService from '../portfolio/portfolio.service';
import '../../../globals';

type Module = 'portfolio' | 'fixed' | 'stock' | 'crypto';

type PortfolioMethod = keyof typeof portfolioService;
type FixedMethod = keyof typeof fixedService;
type StockMethod = keyof typeof stockService;
type CryptoMethod = keyof typeof cryptoService;
type Method = PortfolioMethod | FixedMethod | StockMethod | CryptoMethod;

const log = buildLogger('Process Script');

const logOptions = {
  breakLineAbove: true,
  separatorAbove: '=',
  separatorBelow: '-',
};

const modules = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
  portfolio: portfolioService,
};

const runActionFunc = async <Params>(
  module: Module,
  method: Method,
  params: Params
): Promise<unknown> => {
  log(`Executing ${method} method on ${module} module`, logOptions);

  const service = modules[module];
  // @ts-ignore
  const actionFunc = service[method];
  return await actionFunc(params);
};

interface Action {
  module: Module;
  method: Method;
  params: unknown;
  defaultParams: unknown;
}

interface Script {
  enable: boolean;
  actions: Action[];
}

export default async (script: Script) => {
  const { enable, actions } = script;

  if (!enable) return { status: 'scriptNotEnabled' };

  const actionStatus = [];

  for await (let action of actions) {
    const { module, method, params, defaultParams } = action;

    let result;

    try {
      if (Array.isArray(params)) {
        for await (let paramSet of params) {
          // FIXME result will be overwritten
          result = await runActionFunc(
            module,
            method,
            _.merge({}, defaultParams, paramSet)
          );
        }
      } else {
        result = await runActionFunc(module, method, params);
      }
    } catch (e) {
      console.error(e);
    }

    actionStatus.push({ module, method, result });
  }

  return { status: 'ok', actions: actionStatus };
};
