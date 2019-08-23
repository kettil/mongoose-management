import { collectionMainEvaluation, collectionMainQuestions } from './collectionMain';

import { dataCollectionType } from '../../types';

/**
 *
 */
describe('Check the collectionMain functions', () => {
  let indexes: dataCollectionType[];

  /**
   *
   */
  beforeEach(() => {
    indexes = [{ name: 'name1', columns: [], indexes: [] }, { name: 'name2', columns: [], indexes: [] }];
  });

  /**
   *
   */
  describe('Check the collectionMainQuestions()', () => {
    /**
     *
     */
    test('it should be return choices when the function is called without index', () => {
      const result = collectionMainQuestions(undefined, indexes);

      expect(result).toEqual([
        {
          message: 'Collection name:',
          name: 'name',
          type: 'input',
          validate: expect.any(Function),
        },
      ]);
    });

    /**
     *
     */
    test('it should be return choices when the function is called with index', () => {
      const result = collectionMainQuestions(indexes[1], indexes);

      expect(result).toEqual([
        {
          default: 'name2',
          message: 'Collection name:',
          name: 'name',
          type: 'input',
          validate: expect.any(Function),
        },
      ]);
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called with an unknown name (from first question)', () => {
      const questions = collectionMainQuestions(undefined, indexes);

      const validate = questions[0].validate;

      const result = validate('nameUnknown');

      expect(result).toBe(true);
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called with a duplicate name (from first question)', () => {
      const questions = collectionMainQuestions(undefined, indexes);

      const validate = questions[0].validate;

      const result = validate('name2');

      expect(result).toBe('A collection with the name already exists!');
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called with a invalid name (from first question)', () => {
      const questions = collectionMainQuestions(undefined, indexes);

      const validate = questions[0].validate;

      const result = validate('_Test.hello_');

      expect(result).toBe(
        'Only letters, numbers and hyphens are allowed and the first character must be a small letter! (RegExp: ^[a-z](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$|^$)',
      );
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called without name (from first question)', () => {
      const questions = collectionMainQuestions(undefined, indexes);

      const validate = questions[0].validate;

      const result = validate('');

      expect(result).toBe(true);
    });
  });

  /**
   *
   */
  describe('Check the collectionMainEvaluation()', () => {
    /**
     *
     */
    test('it should be create collection object when the function is called without index', () => {
      const result = collectionMainEvaluation(undefined, { name: 'testName' });

      expect(result).toEqual({ columns: [], indexes: [], name: 'testName' });
    });

    /**
     *
     */
    test('it should be update collection object when the function is called with index', () => {
      const index = { columns: [], indexes: [], name: 'testName' };

      const result = collectionMainEvaluation(index, { name: 'testName' });

      expect(result).toBe(index);
      expect(result.name).toBe('testName');
    });
  });
});
