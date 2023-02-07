let files = {};

export const mockFile = (filename, data) => (files[filename] = data);

export const clearMockFiles = () => (files = {});

export const promises = {
  readFile: jest.fn(filename => {
    const data = files[filename];
    if (!data) {
      throw new Error(`ENOENT: no such file or directory, open '${filename}'`);
    }
    return files[filename];
  }),
  writeFile: jest.fn((filename, data) =>
    Promise.resolve((files[filename] = data))
  ),
};
