import { promises as fs } from 'fs';
import path from 'path';
import processScript from './processScript.service';

const requireUncached = (module: string) => {
  delete require.cache[require.resolve(module)];
  return require(module);
};

const loadScript = async (filename: string) => {
  const rawFileBuffer = await fs.readFile(filename, 'utf-8');
  const rawFile = rawFileBuffer.toString();

  const enableFieldMetadataFinderExp =
    /(\/\*\*\n\s\*\s@enable\s)(.*)(\n\s\*\/)/gm;
  const regexResult = enableFieldMetadataFinderExp.exec(rawFile);
  const enable = regexResult && regexResult[2];

  const modulePath = path.resolve(filename);
  const script = requireUncached(modulePath).default;
  script.enable = enable === 'true';

  const disabledScript = rawFile.replace(
    enableFieldMetadataFinderExp,
    '$1false$3'
  );
  await fs.writeFile(filename, disabledScript, 'utf-8');

  return script;
};

export default async (filename: string) => {
  const script = await loadScript(filename);
  const result = await processScript(script);

  const resultReport = result.actionResults?.map(actionResult => ({
    ...actionResult,
    params: JSON.stringify(actionResult.params),
  }));

  console.table(resultReport);
};
