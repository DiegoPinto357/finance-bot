import _ from 'lodash';
import portfolioService from './modules/portfolio/portfolio.service';
import processScript from './processScript';

jest.mock('./providers/googleSheets');
jest.mock('./providers/database');
jest.mock('./providers/tradingView');
jest.mock('./providers/binance');
jest.mock('./providers/coinMarketCap');
jest.mock('./providers/blockchain');

jest.spyOn(portfolioService, 'deposit');
jest.spyOn(portfolioService, 'transfer');

describe('processScript', () => {
  beforeEach(() => jest.clearAllMocks());

  it('process script', async () => {
    const script = {
      enable: true,
      module: 'portfolio',
      action: 'transfer',
      defaultParams: {
        value: 357,
        options: {
          portfolio: 'previdencia',
          origin: { class: 'fixed', name: 'nubank' },
          destiny: { class: 'crypto', name: 'hodl' },
        },
      },
    };

    await processScript(script);

    expect(portfolioService.transfer).toBeCalledTimes(1);
    expect(portfolioService.transfer).toBeCalledWith(
      ...Object.values(script.defaultParams)
    );
  });

  it('does not process script if enable field is not true', async () => {
    const script = {
      enable: false,
      module: 'portfolio',
      action: 'transfer',
      defaultParams: {
        value: 357,
        options: {
          portfolio: 'previdencia',
          origin: { class: 'fixed', name: 'nubank' },
          destiny: { class: 'crypto', name: 'hodl' },
        },
      },
    };

    await processScript(script);

    expect(portfolioService.transfer).not.toBeCalled();
  });

  it('does not process script if enable field is missing', async () => {
    const script = {
      module: 'portfolio',
      action: 'transfer',
      defaultParams: {
        value: 357,
        options: {
          portfolio: 'previdencia',
          origin: { class: 'fixed', name: 'nubank' },
          destiny: { class: 'crypto', name: 'hodl' },
        },
      },
    };

    await processScript(script);

    expect(portfolioService.transfer).not.toBeCalled();
  });

  it('process multiple actions', async () => {
    const script = {
      enable: true,
      module: 'portfolio',
      action: 'transfer',
      defaultParams: {
        value: 357,
        options: {
          portfolio: 'previdencia',
          origin: { class: 'fixed', name: 'nubank' },
          destiny: { class: 'crypto', name: 'hodl' },
        },
      },
    };

    await processScript(script);

    expect(portfolioService.transfer).toBeCalledTimes(1);
    expect(portfolioService.transfer).toBeCalledWith(
      ...Object.values(script.defaultParams)
    );
  });

  it('process action with multiple params', async () => {
    const script = {
      enable: true,
      module: 'portfolio',
      action: 'deposit',
      defaultParams: {
        options: {
          assetClass: 'fixed',
          assetName: 'nubank',
        },
      },
      params: [
        { options: { portfolio: 'amortecedor', value: 100 } },
        { options: { portfolio: 'previdencia', value: 150 } },
        { options: { portfolio: 'financiamento', value: 200 } },
      ],
    };

    await processScript(script);

    expect(portfolioService.deposit).toBeCalledTimes(script.params.length);
    script.params.forEach(params =>
      expect(portfolioService.deposit).toBeCalledWith(
        ...Object.values(_.merge({}, script.defaultParams, params))
      )
    );
  });
});
