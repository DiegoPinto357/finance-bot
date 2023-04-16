let files = {};

const mockFile = (filename, data) => (files[filename] = data);

const clearMockFiles = () => (files = {});

const readFile = jest.fn(filename => {
  const data = files[filename];
  if (!data) {
    throw new Error(`ENOENT: no such file or directory, open '${filename}'`);
  }
  return files[filename];
});

const writeFile = jest.fn((filename, data) =>
  Promise.resolve((files[filename] = data))
);

module.exports = {
  promises: {
    readFile,
    writeFile,
  },

  mockFile,
  clearMockFiles,
};
