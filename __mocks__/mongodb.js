export const mockToArrayFn = jest.fn();

export const mockFindFn = jest.fn(() => ({
  toArray: mockToArrayFn,
}));

export const mockCollectionFn = jest.fn(() => ({ find: mockFindFn }));

export const mockDbFn = jest.fn(() => ({ collection: mockCollectionFn }));

export const instance = {
  connect: jest.fn(),
  db: mockDbFn,
};

export const MongoClient = jest.fn().mockImplementation(() => instance);
