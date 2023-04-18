const { promises: fs } = require('fs');
const path = require('path');
const fleece = require('golden-fleece');
const processScript = require('./processScript.service');

const getFileExtension = filename => filename.split('.').pop().toLowerCase();

const requireUncached = module => {
  delete require.cache[require.resolve(module)];
  return require(module);
};

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

  const modulePath = path.resolve(filename);
  const script = requireUncached(modulePath);
  script.enable = enable === 'true';

  const disabledScript = rawFile.replace(
    enableFieldMetadataFinderExp,
    '$1false$3'
  );
  await fs.writeFile(filename, disabledScript, 'utf-8');

  return script;
};

module.exports = async filename => {
  const fileExtension = getFileExtension(filename);

  const script =
    fileExtension === 'json5'
      ? await loadJson5Script(filename)
      : await loadJsScript(filename);
  const results = await processScript(script);

  console.dir(results, { depth: null });
};
