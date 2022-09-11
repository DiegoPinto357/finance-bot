import _ from 'lodash';
import portfolioService from '../portfolio/portfolio.service';

const modules = {
  portfolio: portfolioService,
};

export default async script => {
  const { enable, actions } = script;

  if (!enable) return;

  for await (let action of actions) {
    const { module, method, params, defaultParams } = action;

    const service = modules[module];
    const actionFunc = service[method];

    if (Array.isArray(params)) {
      for await (let paramSet of params) {
        await actionFunc(_.merge({}, defaultParams, paramSet));
      }
    } else await actionFunc(params);
  }
};
