import _ from 'lodash';
import portfolioService from './modules/portfolio/portfolio.service';

const modules = {
  portfolio: portfolioService,
};

export default async script => {
  const { enable, module, action, defaultParams, params } = script;

  if (!enable) return;

  const service = modules[module];
  const actionFunc = service[action];

  if (Array.isArray(params)) {
    for await (let paramSet of params) {
      await actionFunc(...Object.values(_.merge({}, defaultParams, paramSet)));
    }
    return;
  }

  await actionFunc(...Object.values(defaultParams));
};
