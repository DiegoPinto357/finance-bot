import { promises as fs } from 'fs';
import path from 'path';
import * as fleece from 'golden-fleece';
import processScript from './processScript.service';

const getFileExtension = filename => filename.split('.').pop().toLowerCase();

export default async filename => {
  const fileExtension = getFileExtension(filename);

  let rawScript;
  let script;

  if (fileExtension === 'json5') {
    rawScript = await fs.readFile(filename, 'utf-8');
    script = await fleece.evaluate(rawScript);
  }

  if (fileExtension === 'js') {
    const rawFileBuffer = await fs.readFile(filename, 'utf-8');
    const rawFile = rawFileBuffer.toString();

    const enableFieldMetadataFinderExp =
      /(?:\/\*\*\n\s\*\s@enable\s)(.*)(?:\n\s\*\/)/gm;
    const regexResult = enableFieldMetadataFinderExp.exec(rawFile);
    const enable = regexResult && regexResult[1];

    const module = await import(path.join('../../../', filename));
    script = module.default;
    script.enable = enable === 'true';
  }

  const results = await processScript(script);

  if (results.status === 'ok') {
    if (fileExtension === 'json5') {
      script.enable = false;
      const disabledScript = fleece.patch(rawScript, script);
      await fs.writeFile(filename, disabledScript, 'utf-8');
    }
  }

  console.dir(results, { depth: null });
};
