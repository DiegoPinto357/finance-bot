import type { Config } from '@jest/types';
const config: Config.InitialOptions = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  verbose: true,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  setupFiles: ['<rootDir>/.jest/setEnvVars.js'],
  moduleFileExtensions: ['js', 'ts'],
  testRegex: '((\\.|/*.)(test))\\.(js|ts)?$',
  testPathIgnorePatterns: ['<rootDir>/dist/'],
};
export default config;
