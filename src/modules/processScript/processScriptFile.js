import { promises as fs } from 'fs';
import path from 'path';
import * as fleece from 'golden-fleece';
import processScript from './processScript.service';

const getFileExtension = filename => filename.split('.').pop().toLowerCase();

const loadJson5Script = async filename => {
  const rawFile = await fs.readFile(filename, 'utf-8');
  const script = await fleece.evaluate(rawFile);

  const disabledScript = fleece.patch(rawFile, { ...script, enable: false });
  await fs.writeFile(filename, disabledScript, 'utf-8');

  return script;
};

const loadJsScript = async filename => {
  const rawFileBuffer = await fs.readFile(filename, 'utf-8');
  const rawFile = rawFileBuffer.toString();

  const enableFieldMetadataFinderExp =
    /(\/\*\*\n\s\*\s@enable\s)(.*)(\n\s\*\/)/gm;
  const regexResult = enableFieldMetadataFinderExp.exec(rawFile);
  const enable = regexResult && regexResult[2];

  const module = await import(path.join('../../../', filename));
  const script = module.default;
  script.enable = enable === 'true';

  const disabledScript = rawFile.replace(
    enableFieldMetadataFinderExp,
    '$1false$3'
  );
  await fs.writeFile(filename, disabledScript, 'utf-8');

  return script;
};

export default async filename => {
  const fileExtension = getFileExtension(filename);

  const script =
    fileExtension === 'json5'
      ? await loadJson5Script(filename)
      : await loadJsScript(filename);
  const results = await processScript(script);

  console.dir(results, { depth: null });
};
