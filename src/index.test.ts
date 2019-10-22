jest.mock('./lib/app');

import app from './lib/app';

describe('Check the index file', () => {
  test('it should be call the app() when index file is loaded', (done) => {
    expect.assertions(1);

    require('./index');

    setTimeout(() => {
      expect(app).toHaveBeenCalledTimes(1);

      done();
    }, 250);
  });
});
