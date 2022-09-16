import _ from 'lodash';
import portfolioService from '../portfolio/portfolio.service';

const modules = {
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
