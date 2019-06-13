import main from './index';

/**
 *
 */
describe('Check the function pagination()', () => {
  /**
   *
   */
  test('call the main function', () => {
    const returnValue = main();

    expect(typeof returnValue).toBe('string');
    expect(returnValue).toBe('hello world');
  });
});
