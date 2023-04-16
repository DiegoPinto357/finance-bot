const mockLoggerInstance = jest.fn();

const buildLogger = () => mockLoggerInstance;

module.exports = {
  buildLogger,
  mockLoggerInstance,
};
