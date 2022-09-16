import _ from 'lodash';
import portfolioService from '../portfolio/portfolio.service';
import processScript from './processScript.service';

jest.mock('../../providers/googleSheets');
jest.mock('../../providers/tradingView');
jest.mock('../../providers/binance');
jest.mock('../../providers/coinMarketCap');
jest.mock('../../providers/blockchain');
jest.mock('../../providers/database');

jest.spyOn(portfolioService, 'deposit');
jest.spyOn(portfolioService, 'transfer');
jest.spyOn(portfolioService, 'swap');

describe('processScript', () => {
  beforeEach(() => jest.clearAllMocks());

  it('process script', async () => {
    const script = {
      enable: true,
      actions: [
        {
          module: 'portfolio',
          method: 'swap',
          params: {
            value: 357,
            portfolio: 'previdencia',
            origin: { class: 'fixed', name: 'nubank' },
            destiny: { class: 'crypto', name: 'hodl' },
            liquidity: 'amortecedor',
          },
        },
      ],
    };

    const { status } = await processScript(script);

    expect(status).toBe('ok');
    expect(portfolioService.swap).toBeCalledTimes(1);
    expect(portfolioService.swap).toBeCalledWith(script.actions[0].params);
  });

  it('does not process script if enable field is not true', async () => {
    const script = {
      enable: false,
      actions: [
        {
          module: 'portfolio',
          method: 'deposit',
          params: {
            assetClass: 'fixed',
            assetName: 'nubank',
            portfolio: 'previdencia',
            value: 357,
          },
        },
      ],
    };

    const { status } = await processScript(script);

    expect(status).toBe('scriptNotEnabled');
    expect(portfolioService.transfer).not.toBeCalled();
  });

  it('does not process script if enable field is missing', async () => {
    const script = {
      actions: [
        {
          module: 'portfolio',
          method: 'deposit',
          params: {
            assetClass: 'fixed',
            assetName: 'nubank',
            portfolio: 'previdencia',
            value: 357,
          },
        },
      ],
    };

    const { status } = await processScript(script);

    expect(status).toBe('scriptNotEnabled');
    expect(portfolioService.transfer).not.toBeCalled();
  });

  it('process multiple actions', async () => {
    const script = {
      enable: true,
      actions: [
        {
          module: 'portfolio',
          method: 'deposit',
          params: {
            assetClass: 'fixed',
            assetName: 'nubank',
            portfolio: 'previdencia',
            value: 100,
          },
        },
        {
          module: 'portfolio',
          method: 'transfer',
          params: {
            portfolio: 'previdencia',
            value: 100,
            origin: { class: 'fixed', name: 'nubank' },
            destiny: { class: 'crypto', name: 'hodl' },
          },
        },
      ],
    };

    const { status } = await processScript(script);

    expect(status).toBe('ok');
    expect(portfolioService.deposit).toBeCalledTimes(1);
    expect(portfolioService.deposit).toBeCalledWith(script.actions[0].params);
    expect(portfolioService.transfer).toBeCalledTimes(1);
    expect(portfolioService.transfer).toBeCalledWith(script.actions[1].params);
  });

  it('process action with multiple params', async () => {
    const script = {
      enable: true,
      actions: [
        {
          module: 'portfolio',
          method: 'deposit',
          defaultParams: {
            assetClass: 'fixed',
            assetName: 'nubank',
          },
          params: [
            { portfolio: 'amortecedor', value: 100 },
            { portfolio: 'previdencia', value: 150 },
            { portfolio: 'financiamento', value: 200 },
          ],
        },
      ],
    };

    const { status } = await processScript(script);

    expect(status).toBe('ok');
    expect(portfolioService.deposit).toBeCalledTimes(
      script.actions[0].params.length
    );
    script.actions[0].params.forEach(params =>
      expect(portfolioService.deposit).toBeCalledWith(
        _.merge({}, script.actions[0].defaultParams, params)
      )
    );
  });

  it('process multiple actions with multiple params', async () => {
    const script = {
      enable: true,
      actions: [
        {
          module: 'portfolio',
          method: 'deposit',
          defaultParams: {
            assetClass: 'fixed',
            assetName: 'nubank',
          },
          params: [
            { portfolio: 'previdencia', value: 100 },
            { portfolio: 'amortecedor', value: 250 },
          ],
        },
        {
          module: 'portfolio',
          method: 'transfer',
          defaultParams: {
            origin: { class: 'fixed', name: 'nubank' },
            destiny: { class: 'crypto', name: 'hodl' },
          },
          params: [
            { portfolio: 'previdencia', value: 100 },
            { portfolio: 'amortecedor', value: 250 },
          ],
        },
      ],
    };

    const { status } = await processScript(script);

    expect(status).toBe('ok');
    expect(portfolioService.deposit).toBeCalledTimes(2);
    script.actions[0].params.forEach(params =>
      expect(portfolioService.deposit).toBeCalledWith(
        _.merge({}, script.actions[0].defaultParams, params)
      )
    );

    expect(portfolioService.transfer).toBeCalledTimes(2);
    script.actions[1].params.forEach(params =>
      expect(portfolioService.transfer).toBeCalledWith(
        _.merge({}, script.actions[1].defaultParams, params)
      )
    );
  });
});
