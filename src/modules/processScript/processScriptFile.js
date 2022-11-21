import { promises as fs } from 'fs';
import path from 'path';
import * as fleece from 'golden-fleece';
import processScript from './processScript.service';

const getFileExtension = filename => filename.split('.').pop().toLowerCase();

export default async filename => {
  const fileExtension = getFileExtension(filename);
  console.log({ fileExtension });

  let rawScript;
  let script;

  if (fileExtension === 'json5') {
    rawScript = await fs.readFile(filename, 'utf-8');
    script = await fleece.evaluate(rawScript);
  }

  if (fileExtension === 'js') {
    const module = await import(path.join('../../../', filename));
    script = module.default;
    script.enable = true;
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
