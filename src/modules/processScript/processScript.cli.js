import { loadFile, saveFile } from '../../libs/storage';
import processScript from './processScript.service';

export default async args => {
  const filename = args._[1];
  const script = await loadFile(filename);
  await processScript(script);

  script.enable = false;
  await saveFile(filename, script);
};
