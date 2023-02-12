export const mockToArrayFn = jest.fn();

export const mockFindFn = jest.fn(() => ({
  toArray: mockToArrayFn,
}));

export const mockFindOneFn = jest.fn();

export const mockInsertOneFn = jest.fn();

export const mockUpdateOneFn = jest.fn();

export const mockBulkWriteFn = jest.fn();

export const mockCollectionFn = jest.fn(() => ({
  find: mockFindFn,
  findOne: mockFindOneFn,
  insertOne: mockInsertOneFn,
  updateOne: mockUpdateOneFn,
  bulkWrite: mockBulkWriteFn,
}));

export const mockDbFn = jest.fn(() => ({ collection: mockCollectionFn }));

export const instance = {
  connect: jest.fn(),
  db: mockDbFn,
};

export const MongoClient = jest.fn().mockImplementation(() => instance);
