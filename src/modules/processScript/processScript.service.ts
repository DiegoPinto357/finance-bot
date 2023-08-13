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

interface Run {
  module: Module;
  method: Method;
  params?: object;
}

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

  const runs = actions.reduce((runs, action) => {
    const { module, method, params, defaultParams } = action;
    if (Array.isArray(params)) {
      runs.push(
        ...params.map(paramSet => ({
          module,
          method,
          params: _.merge({}, defaultParams, paramSet),
        }))
      );
      return runs;
    }

    runs.push({ module, method, params });
    return runs;
  }, [] as Run[]);

  const actionResults: ActionResult[] = [];

  for await (const run of runs) {
    const { module, method, params } = run;

    try {
      const result = (await runActionFunc(
        module,
        method,
        params
      )) as FuncResult;
      actionResults.push({ module, method, status: result?.status });
    } catch (error) {
      let errorMessage;
      if (error instanceof Error) errorMessage = error.message;
      else errorMessage = String(error);

      actionResults.push({ module, method, status: errorMessage });

      const pendingRuns = runs.slice(actionResults.length);
      actionResults.push(
        ...pendingRuns.map(({ module, method }) => ({
          module,
          method,
          status: 'notExecuted',
        }))
      );

      return { status: 'error', actionResults };
    }
  }

  return { status: 'ok', actionResults };
};
