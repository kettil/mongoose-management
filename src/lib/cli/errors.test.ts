import { BackToCollectionError, CancelPromptError } from './errors';

describe('Check the error classes', () => {
  test('it should be an instance of the class error - CancelPromptError', () => {
    const err = new CancelPromptError('error message');

    expect(err).toBeInstanceOf(Error);
  });

  test('it should be an instance of the class error - BackToCollectionError', () => {
    const err = new BackToCollectionError('error message');

    expect(err).toBeInstanceOf(Error);
  });
});
