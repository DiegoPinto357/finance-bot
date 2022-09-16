import { loadFile, saveFile } from '../../libs/storage';
import processScript from './processScript.service';

export default async args => {
  const filename = args._[1];
  const script = await loadFile(filename);
  const results = await processScript(script);

  if (results.status === 'ok') {
    script.enable = false;
    await saveFile(filename, script);
  }

  console.dir(results, { depth: null });
};
