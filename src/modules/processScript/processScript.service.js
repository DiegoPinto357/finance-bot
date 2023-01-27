import _ from 'lodash';
import { buildLogger } from '../../libs/logger';
import fixedService from '../fixed/fixed.service';
import stockService from '../stock/stock.service';
import cryptoService from '../crypto/crypto.service';
import portfolioService from '../portfolio/portfolio.service';
import '../../../globals';

const log = buildLogger('Process Script');

const logOptions = {
  breakLineAbove: true,
  separatoAbove: '=',
  separatorBelow: '-',
};

const modules = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
  portfolio: portfolioService,
};

const runActionFunc = async (module, method, params) => {
  log(`Executing ${method} method on ${module} module`, logOptions);

  const service = modules[module];
  const actionFunc = service[method];
  return await actionFunc(params);
};

export default async script => {
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
