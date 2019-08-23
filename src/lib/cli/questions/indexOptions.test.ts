import { indexOptionsEvaluation, indexOptionsQuestions } from './indexOptions';

import { dataIndexType } from '../../types';

/**
 *
 */
describe('Check the indexOptions functions', () => {
  /**
   *
   */
  describe('Check the indexOptionsQuestions()', () => {
    /**
     *
     */
    test('it should be return choices when the function is called without index', () => {
      const result = indexOptionsQuestions(undefined);

      expect(result).toEqual([
        {
          default: undefined,
          message: 'Unique index?',
          name: 'unique',
          type: 'confirm',
        },
        {
          default: undefined,
          message: 'Sparse index?',
          name: 'sparse',
          type: 'confirm',
        },
      ]);
    });

    /**
     *
     */
    test('it should be return choices when the function is called with index', () => {
      const result = indexOptionsQuestions({
        name: 'indexName',
        columns: { column1: 'hashed' },
        properties: { unique: true, sparse: true },
      });

      expect(result).toEqual([
        {
          default: true,
          message: 'Unique index?',
          name: 'unique',
          type: 'confirm',
        },
        {
          default: true,
          message: 'Sparse index?',
          name: 'sparse',
          type: 'confirm',
        },
      ]);
    });
  });

  /**
   *
   */
  describe('Check the indexOptionsEvaluation()', () => {
    /**
     *
     */
    test('it should be create column object when the function is called', () => {
      const index: dataIndexType = {
        name: 'indexName',
        columns: { column1: 'hashed' },
        properties: { unique: true, sparse: true },
      };

      indexOptionsEvaluation(index, { unique: true, sparse: false });

      expect(index).toEqual({
        name: 'indexName',
        columns: { column1: 'hashed' },
        properties: { unique: true, sparse: false },
      });
    });
  });
});
