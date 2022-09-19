import { promises as fs, mockFile, clearMockFiles } from 'fs';
import * as fleece from 'golden-fleece';
import yargs, { mockUserInput } from 'yargs';
import portfolioService from '../portfolio/portfolio.service';
import processScriptCLI from './processScript.cli';

jest.mock('fs');
jest.mock('../portfolio/portfolio.service');

global.console = { dir: jest.fn() };

const scriptFile = './scripts/deposit.JSON5';
const scriptData = {
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

describe('processScript cli', () => {
  beforeEach(() => {
    clearMockFiles();
    jest.clearAllMocks();
  });

  it('runs script from file', async () => {
    mockFile(
      scriptFile,
      fleece.stringify(scriptData, { singleQuotes: true, spaces: 2 })
    );
    mockUserInput({ _: ['process', scriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    expect(fs.readFile).toBeCalledTimes(1);
    expect(fs.readFile).toBeCalledWith(scriptFile, 'utf-8');
    expect(portfolioService.swap).toBeCalledTimes(1);
    expect(portfolioService.swap).toBeCalledWith(scriptData.actions[0].params);
  });

  it('does not run script if enable field is false', async () => {
    mockFile(
      scriptFile,
      fleece.stringify(
        { ...scriptData, enable: false },
        { singleQuotes: true, spaces: 2 }
      )
    );
    mockUserInput({ _: ['process', scriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    expect(fs.readFile).toBeCalledTimes(1);
    expect(fs.readFile).toBeCalledWith(scriptFile, 'utf-8');
    expect(portfolioService.swap).not.toBeCalled();
  });

  it('sets enable field to false after run a script file', async () => {
    mockFile(
      scriptFile,
      fleece.stringify(scriptData, { singleQuotes: true, spaces: 2 })
    );
    mockUserInput({ _: ['process', scriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    const scriptFileAfterRun = await fleece.evaluate(
      await fs.readFile(scriptFile, 'utf-8')
    );

    expect(scriptFileAfterRun.enable).toBe(false);
  });

  it('does not remove comments and formatting when saving a script', async () => {
    const rawJSON5Script = `{
      enable: true,
      actions: [
        {
          module: 'fixed',
          method: 'setAssetValue',
          params: [
            // some comment
            { asset: 'iti', value: 10709.67 },
            { asset: 'nubank', value: 36277.2 },
          ],
        },
      ],
    }
    `;
    mockFile(scriptFile, rawJSON5Script);
    mockUserInput({ _: ['process', scriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    const scriptFileAfterRun = await fs.readFile(scriptFile, 'utf-8');

    const expectedScriptFileAfterRun = `{
      enable: false,
      actions: [
        {
          module: 'fixed',
          method: 'setAssetValue',
          params: [
            // some comment
            { asset: 'iti', value: 10709.67 },
            { asset: 'nubank', value: 36277.2 },
          ],
        },
      ],
    }
    `;

    expect(scriptFileAfterRun).toBe(expectedScriptFileAfterRun);
  });
});
