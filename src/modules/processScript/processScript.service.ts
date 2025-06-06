import _ from 'lodash';
import { buildLogger } from '../../libs/logger';
import fixedService from '../fixed/fixed.service';
import stockService from '../stock/stock.service';
import cryptoService from '../crypto/crypto.service';
import portfolioService from '../portfolio/portfolio.service';
import { Module, Method, Script } from './types';
import '../../../globals';

const debug = false;
const verbose = true;

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

  if (debug || verbose) {
    console.dir({ params }, { depth: null });
  }

  if (debug) return { status: 'debug' };

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
  skip?: boolean;
}

interface ActionResult {
  module: Module;
  method: Method;
  params?: object;
  status: string;
}

interface FuncResult {
  status: string;
}

export default async (script: Script) => {
  const { enable, actions } = script;

  if (!enable) return { status: 'scriptNotEnabled' };

  const runs = actions.reduce((runs, action) => {
    const { module, method, params, defaultParams, skip } = action;
    if (Array.isArray(params)) {
      runs.push(
        ...params.map(paramSet => ({
          module,
          method,
          params: _.merge({}, defaultParams, paramSet),
          skip,
        }))
      );
      return runs;
    }

    runs.push({ module, method, params, skip });
    return runs;
  }, [] as Run[]);

  const actionResults: ActionResult[] = [];

  for await (const run of runs) {
    const { module, method, params, skip } = run;

    if (skip) {
      actionResults.push({
        module,
        method,
        params,
        status: 'skipped',
      });
      continue;
    }

    try {
      const result = (await runActionFunc(
        module,
        method,
        params
      )) as FuncResult;

      if (
        result?.status &&
        result.status !== 'ok' &&
        result.status !== 'debug'
      ) {
        throw new Error(result.status);
      }

      actionResults.push({
        module,
        method,
        params,
        status: result?.status,
      });
    } catch (error) {
      let errorMessage;
      if (error instanceof Error) errorMessage = error.message;
      else errorMessage = String(error);

      actionResults.push({
        module,
        method,
        params,
        status: errorMessage,
      });

      const pendingRuns = runs.slice(actionResults.length);
      actionResults.push(
        ...pendingRuns.map(({ module, method, params }) => ({
          module,
          method,
          params,
          status: 'notExecuted',
        }))
      );

      return { status: 'error', actionResults };
    }
  }

  return { status: 'ok', actionResults };
};
