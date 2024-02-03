import { promises as fs, mockFile, clearMockFiles } from 'fs';
import path from 'path';
import yargs, { mockUserInput } from 'yargs';
import portfolioService from '../portfolio/portfolio.service';
import processScriptCLI from './processScript.cli';

const { mockUserInput } = yargs();

jest.mock('fs');
jest.mock('yargs');
jest.mock('../portfolio/portfolio.service');
jest.mock('../../providers/brapi');

jest.useFakeTimers('modern').setSystemTime(new Date(2020, 9, 1, 7));

global.console = {
  log: jest.fn(),
  dir: jest.fn(),
  error: jest.fn(),
  table: jest.fn(),
};

const mockJsFileModule = async filename => {
  const { promises: actualFs } = jest.requireActual('fs');
  const fileData = await actualFs.readFile(filename);
  mockFile(filename, fileData);
};

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

  it('process script from js file', async () => {
    const jsScriptFile = path.resolve(
      'mockData/processScript/enabledJsScriptFile.js'
    );

    await mockJsFileModule(jsScriptFile);
    mockUserInput({ _: ['process', jsScriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    expect(portfolioService.swap).toBeCalledTimes(1);
    expect(portfolioService.swap).toBeCalledWith(scriptData.actions[0].params);
  });

  it('does not run script if enable metadata field is false', async () => {
    const jsScriptFile = path.resolve(
      'mockData/processScript/disabledJsScriptFile.js'
    );

    await mockJsFileModule(jsScriptFile);
    mockUserInput({ _: ['process', jsScriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    expect(portfolioService.swap).not.toBeCalled();
  });

  it('does not run script if metadata invalid', async () => {
    const jsScriptFile = path.resolve(
      'mockData/processScript/invalidMetadataJsScriptFile.js'
    );

    await mockJsFileModule(jsScriptFile);
    mockUserInput({ _: ['process', jsScriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    expect(portfolioService.swap).not.toBeCalled();
  });

  it('does not run script if metadata is missing', async () => {
    const jsScriptFile = path.resolve(
      'mockData/processScript/noMetadataJsScriptFile.js'
    );

    await mockJsFileModule(jsScriptFile);
    mockUserInput({ _: ['process', jsScriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    expect(portfolioService.swap).not.toBeCalled();
  });

  it('sets enable metadata field to false after run a script file', async () => {
    const jsScriptFile = 'mockData/processScript/enabledJsScriptFile.js';

    const { promises: actualFs } = jest.requireActual('fs');
    mockFile(jsScriptFile, await actualFs.readFile(jsScriptFile));
    mockUserInput({ _: ['process', jsScriptFile] });

    const { argv } = yargs();
    await processScriptCLI(argv);

    const fileAfterRunBuffer = await fs.readFile(jsScriptFile, 'utf-8');
    const fileAfterRun = fileAfterRunBuffer.toString();

    const enableFieldMetadataFinderExp =
      /(\/\*\*\n\s\*\s@enable\s)(.*)(\n\s\*\/)/gm;
    const regexResult = enableFieldMetadataFinderExp.exec(fileAfterRun);
    const enableFieldAfterRun = regexResult[2];

    expect(enableFieldAfterRun).toBe('false');
  });
});
