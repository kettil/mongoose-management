// export modified jest config
module.exports = Object.assign({}, require('./jest.json'), {
  coverageReporters: ['json-summary'],
});
