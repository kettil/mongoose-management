// export modified jest config
module.exports = Object.assign({}, require('./jest.json'), {
  // only text coverage
  coverageReporters: ['text', 'text-summary'],
});
