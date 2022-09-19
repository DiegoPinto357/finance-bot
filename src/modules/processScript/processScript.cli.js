import { promises as fs } from 'fs';
import * as fleece from 'golden-fleece';
import processScript from './processScript.service';

export default async args => {
  const filename = args._[1];
  const rawScript = await fs.readFile(filename, 'utf-8');
  const script = await fleece.evaluate(rawScript);

  const results = await processScript(script);

  if (results.status === 'ok') {
    script.enable = false;
    const disabledScript = fleece.patch(rawScript, script);
    await fs.writeFile(filename, disabledScript, 'utf-8');
  }

  console.dir(results, { depth: null });
};
