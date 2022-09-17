import _ from 'lodash';
import fixedService from '../fixed/fixed.service';
import stockService from '../stock/stock.service';
import cryptoService from '../crypto/crypto.service';
import portfolioService from '../portfolio/portfolio.service';

const modules = {
  fixed: fixedService,
  stock: stockService,
  crypto: cryptoService,
  portfolio: portfolioService,
};

export default async script => {
  const { enable, actions } = script;

  if (!enable) return { status: 'scriptNotEnabled' };

  const actionStatus = [];

  for await (let action of actions) {
    const { module, method, params, defaultParams } = action;

    const service = modules[module];
    const actionFunc = service[method];

    let result;

    if (Array.isArray(params)) {
      for await (let paramSet of params) {
        result = await actionFunc(_.merge({}, defaultParams, paramSet));
      }
    } else result = await actionFunc(params);

    actionStatus.push({ module, method, result });
  }

  return { status: 'ok', actions: actionStatus };
};
