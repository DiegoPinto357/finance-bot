const processScriptFile = require('./processScriptFile');

module.exports = async args => {
  const filename = args._[1];
  await processScriptFile(filename);
};
