// expand jest config for ci
var jest = {
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
};

// export modified jest config
module.exports = Object.assign({}, require('./jest.json'), jest);
