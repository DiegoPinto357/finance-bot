let files = {};

export const mockFile = (filename, data) => (files[filename] = data);

export const clearMockFiles = () => (files = {});

export const promises = {
  readFile: jest.fn(filename => files[filename]),
  writeFile: jest.fn((filename, data) =>
    Promise.resolve((files[filename] = data))
  ),
};
