const modules = [];

export const mockModule = (module, data) => (modules[module] = data);

export default jest.fn(module => Promise.resolve(modules[module]));
