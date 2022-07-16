export const instance = {
  connect: jest.fn(),
};

export const MongoClient = jest.fn().mockImplementation(() => instance);
