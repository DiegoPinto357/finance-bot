let argv;

const mockUserInput = args => (argv = args);

module.exports = () => ({ argv, mockUserInput });
