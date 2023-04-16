const mockToArrayFn = jest.fn();

const mockFindFn = jest.fn(() => ({
  toArray: mockToArrayFn,
}));

const mockFindOneFn = jest.fn();

const mockInsertOneFn = jest.fn();

const mockUpdateOneFn = jest.fn();

const mockDeleteOneFn = jest.fn();

const mockBulkWriteFn = jest.fn();

const mockCollectionFn = jest.fn(() => ({
  find: mockFindFn,
  findOne: mockFindOneFn,
  insertOne: mockInsertOneFn,
  updateOne: mockUpdateOneFn,
  deleteOne: mockDeleteOneFn,
  bulkWrite: mockBulkWriteFn,
}));

const mockDbFn = jest.fn(() => ({ collection: mockCollectionFn }));

const instance = {
  connect: jest.fn(),
  db: mockDbFn,
};

const MongoClient = jest.fn().mockImplementation(() => instance);

module.exports = {
  mockToArrayFn,
  mockFindFn,
  mockFindOneFn,
  mockInsertOneFn,
  mockUpdateOneFn,
  mockDeleteOneFn,
  mockBulkWriteFn,
  mockCollectionFn,
  mockDbFn,
  instance,
  MongoClient,
};
