interface StringIndexed {
  [key: string]: any;
}

let files: StringIndexed = {};

export const mockFile = (filename: string, data: any) =>
  (files[filename] = data);

export const clearMockFiles = () => (files = {});

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

export const promises = {
  readFile,
  writeFile,
};
