import Abstract from './abstract';

/**
 *
 */
describe('Check the abstract class', () => {
  /**
   *
   */
  test('initialize the class', async () => {
    const mockPrompts = jest.fn();

    const abstract = new (Abstract as any)(mockPrompts);

    expect(abstract).toBeInstanceOf(Abstract);
    expect(abstract.prompts).toBe(mockPrompts);
  });
});
