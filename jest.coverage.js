// expand jest config for code coverage
var jest = {
  coverageReporters: ['text', 'lcov'],
  coverageThreshold: {
    global: {
      branches: 25,
      functions: 25,
      lines: 25,
      statements: 25,
    },
  },
};

// export modified jest config
module.exports = Object.assign({}, require('./jest.json'), jest);
