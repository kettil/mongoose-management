// expand jest config for ci
var jest = {
  coverageThreshold: {
    global: {
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
};

// export modified jest config
module.exports = Object.assign({}, require('./jest.json'), jest);
