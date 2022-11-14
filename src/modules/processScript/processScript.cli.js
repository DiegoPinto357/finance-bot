import processScriptFile from './processScriptFile';

export default async args => {
  const filename = args._[1];
  await processScriptFile(filename);
};
