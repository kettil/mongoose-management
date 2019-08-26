import { collectionRemoveQuestions } from './collectionRemove';

/**
 *
 */
describe('Check the collectionRemove functions', () => {
  /**
   *
   */
  describe('Check the collectionMainQuestions()', () => {
    /**
     *
     */
    test('it should be return choices when the function is called with two collections', () => {
      const result = collectionRemoveQuestions([
        { name: 'c1', columns: [], indexes: [] },
        { name: 'c2', columns: [], indexes: [] },
      ]);

      expect(result).toEqual([
        {
          choices: ['c1', 'c2'],
          message: 'Which collections should be deleted?',
          name: 'collections',
          type: 'checkbox',
          when: true,
        },
        {
          default: false,
          message: 'Are the collection(s) really to be deleted?',
          name: 'isConfirm',
          type: 'confirm',
          when: expect.any(Function),
        },
      ]);
    });

    /**
     *
     */
    test('it should be return choices when the function is called with one collections', () => {
      const result = collectionRemoveQuestions([{ name: 'c2', columns: [], indexes: [] }]);

      expect(result).toEqual([
        {
          choices: ['c2'],
          message: 'Which collections should be deleted?',
          name: 'collections',
          type: 'checkbox',
          when: false,
        },
        {
          default: false,
          message: 'Are the collection(s) really to be deleted?',
          name: 'isConfirm',
          type: 'confirm',
          when: expect.any(Function),
        },
      ]);
    });

    /**
     *
     */
    test('it should be return true when when() is called with one selected collections (from "isConfirm" question)', () => {
      const questions = collectionRemoveQuestions([{ name: 'c2', columns: [], indexes: [] }]).filter(
        (q) => q.name === 'isConfirm',
      );
      expect(questions.length).toBe(1);

      const when = questions[0].when;
      expect(typeof when).toBe('function');

      const result = when({ collections: ['c2'] });

      expect(result).toBe(true);
    });

    /**
     *
     */
    test('it should be return true when when() is called with two selected collections (from "isConfirm" question)', () => {
      const questions = collectionRemoveQuestions([
        { name: 'c2', columns: [], indexes: [] },
        { name: 'c1', columns: [], indexes: [] },
      ]).filter((q) => q.name === 'isConfirm');
      expect(questions.length).toBe(1);

      const when = questions[0].when;
      expect(typeof when).toBe('function');

      const result = when({ collections: ['c1', 'c2'] });

      expect(result).toBe(true);
    });

    /**
     *
     */
    test('it should be return false when when() is called without selected collections (from "isConfirm" question)', () => {
      const questions = collectionRemoveQuestions([{ name: 'c2', columns: [], indexes: [] }]).filter(
        (q) => q.name === 'isConfirm',
      );
      expect(questions.length).toBe(1);

      const when = questions[0].when;
      expect(typeof when).toBe('function');

      const result = when({});

      expect(result).toBe(true);
    });
  });
});
