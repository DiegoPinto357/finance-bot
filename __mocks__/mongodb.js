export const mockToArrayFn = jest.fn();

export const mockFindFn = jest.fn(() => ({
  toArray: mockToArrayFn,
}));

export const mockUpdateOneFn = jest.fn();

export const mockCollectionFn = jest.fn(() => ({
  find: mockFindFn,
  updateOne: mockUpdateOneFn,
}));

export const mockDbFn = jest.fn(() => ({ collection: mockCollectionFn }));

export const instance = {
  connect: jest.fn(),
  db: mockDbFn,
};

export const MongoClient = jest.fn().mockImplementation(() => instance);
