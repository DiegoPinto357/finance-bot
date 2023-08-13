import _ from 'lodash';
import { buildLogger } from '../../libs/logger';
import fixedService from '../fixed/fixed.service';
import stockService from '../stock/stock.service';
import cryptoService from '../crypto/crypto.service';
import portfolioService from '../portfolio/portfolio.service';
import { Module, Method, Script } from './types';
import '../../../globals';

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
  const result = await actionFunc(params);
  return result;
};

interface ActionResult {
  module: Module;
  method: Method;
  status: string;
}

interface FuncResult {
  status: string;
}

export default async (script: Script) => {
  const { enable, actions } = script;

  if (!enable) return { status: 'scriptNotEnabled' };

  const actionResults: ActionResult[] = [];

  for await (let action of actions) {
    const { module, method, params, defaultParams } = action;

    let funcResult: FuncResult = { status: 'pending' };

    try {
      if (Array.isArray(params)) {
        for await (let paramSet of params) {
          funcResult = (await runActionFunc(
            module,
            method,
            _.merge({}, defaultParams, paramSet)
          )) as FuncResult;
          actionResults.push({ module, method, status: funcResult?.status });
        }
      } else {
        funcResult = (await runActionFunc(
          module,
          method,
          params
        )) as FuncResult;
        actionResults.push({ module, method, status: funcResult?.status });
      }
    } catch (e) {
      console.error(e);
    }
  }

  return { status: 'ok', actionResults };
};
