import { promises as fs } from 'fs';
import path from 'path';
import * as fleece from 'golden-fleece';
import processScript from './processScript.service';

const getFileExtension = filename => filename.split('.').pop().toLowerCase();

export default async filename => {
  const fileExtension = getFileExtension(filename);

  let rawFile;
  let script;

  if (fileExtension === 'json5') {
    rawFile = await fs.readFile(filename, 'utf-8');
    script = await fleece.evaluate(rawFile);
  }

  const enableFieldMetadataFinderExp =
    /(\/\*\*\n\s\*\s@enable\s)(.*)(\n\s\*\/)/gm;

  if (fileExtension === 'js') {
    const rawFileBuffer = await fs.readFile(filename, 'utf-8');
    rawFile = rawFileBuffer.toString();

    const regexResult = enableFieldMetadataFinderExp.exec(rawFile);
    const enable = regexResult && regexResult[2];

    const module = await import(path.join('../../../', filename));
    script = module.default;
    script.enable = enable === 'true';
  }

  const results = await processScript(script);

  if (results.status === 'ok') {
    if (fileExtension === 'json5') {
      script.enable = false;
      const disabledScript = fleece.patch(rawFile, script);
      await fs.writeFile(filename, disabledScript, 'utf-8');
    }

    if (fileExtension === 'js') {
      const disabledScript = rawFile.replace(
        enableFieldMetadataFinderExp,
        '$1false$3'
      );
      await fs.writeFile(filename, disabledScript, 'utf-8');
    }
  }

  console.dir(results, { depth: null });
};
