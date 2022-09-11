import { promises as fs, mockFile, clearMockFiles } from 'fs';
import yargs, { mockUserInput } from 'yargs';
import { loadFile } from '../../libs/storage';
import portfolioService from '../portfolio/portfolio.service';
import processScriptCLI from './processScript.cli';

jest.mock('fs');
jest.mock('../portfolio/portfolio.service');

const scriptFile = './scripts/deposit.json';
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
    mockFile(scriptFile, JSON.stringify(scriptData));
    mockUserInput({ _: ['process', scriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    expect(fs.readFile).toBeCalledTimes(1);
    expect(fs.readFile).toBeCalledWith(scriptFile, 'utf-8');
    expect(portfolioService.swap).toBeCalledTimes(1);
    expect(portfolioService.swap).toBeCalledWith(scriptData.actions[0].params);
  });

  it('does not run script if enable field is false', async () => {
    mockFile(scriptFile, JSON.stringify({ ...scriptData, enable: false }));
    mockUserInput({ _: ['process', scriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    expect(fs.readFile).toBeCalledTimes(1);
    expect(fs.readFile).toBeCalledWith(scriptFile, 'utf-8');
    expect(portfolioService.swap).not.toBeCalled();
  });

  it('sets enable field to false after run a script file', async () => {
    mockFile(scriptFile, JSON.stringify(scriptData));
    mockUserInput({ _: ['process', scriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    const scriptFileAfterRun = await loadFile(scriptFile);

    expect(scriptFileAfterRun.enable).toBe(false);
  });
});
