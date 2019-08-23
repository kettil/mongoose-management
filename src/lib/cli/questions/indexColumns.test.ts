import { equalIndexColumns, indexColumnsEvaluation, indexColumnsQuestions } from './indexColumns';

import { dataIndexColumnValueType, dataIndexType } from '../../types';

/**
 *
 */
describe('Check the indexColumns functions', () => {
  /**
   *
   */
  describe('Check the indexColumnsQuestions()', () => {
    /**
     *
     */
    test('it should be return choices when the function is called', () => {
      const index: dataIndexType = { name: 'index1', columns: { column1: 1 }, properties: {} };
      const names = ['column1', 'column3'];

      const result = indexColumnsQuestions(index, names);

      expect(result).toEqual([
        {
          choices: [1, -1, 'text', 'hashed'],
          default: 0,
          message: 'Choose a index type for "column1":',
          name: 'column1',
          type: 'list',
        },
        {
          choices: [1, -1, 'text', 'hashed'],
          default: undefined,
          message: 'Choose a index type for "column3":',
          name: 'column3',
          type: 'list',
        },
      ]);
    });
  });

  /**
   *
   */
  describe('Check the indexColumnsEvaluation()', () => {
    /**
     *
     */
    test('it should be create column object when the function is called without duplicate index columns', () => {
      const index: dataIndexType = { name: 'index5', columns: { column1: 1 }, properties: {} };
      const indexes: dataIndexType[] = [
        { name: 'index1', columns: { column4: 1 }, properties: {} },
        { name: 'index3', columns: { column3: 1 }, properties: {} },
      ];

      indexColumnsEvaluation(index, { column3: 1, coluimn1: -1 }, indexes);

      expect(index).toEqual({ name: 'index5', columns: { column3: 1, coluimn1: -1 }, properties: {} });
    });

    /**
     *
     */
    test('it should be create column object when the function is called with duplicate index columns', () => {
      const index: dataIndexType = { name: 'index5', columns: { column: 1 }, properties: {} };
      const indexes: dataIndexType[] = [
        { name: 'index1', columns: { column4: 1 }, properties: {} },
        { name: 'index3', columns: { column3: 1 }, properties: {} },
      ];

      expect.assertions(2);
      try {
        indexColumnsEvaluation(index, { column4: 1 }, indexes);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('An index with the column configuration already exists! (duplicate index: "index1")');
      }
    });
  });

  /**
   *
   */
  describe('Check the helper functions', () => {
    /**
     *
     */
    test('it should be return true when the equalIndexColumns() is called with same objects', () => {
      const index1: { [k: string]: dataIndexColumnValueType } = { column1: 1, column2: 'text' };
      const index2: { [k: string]: dataIndexColumnValueType } = { column1: 1, column2: 'text' };
      const result = equalIndexColumns(index1, index2);

      expect(result).toBe(true);
    });

    /**
     *
     */
    test('it should be return true when the equalIndexColumns() is called with difference objects (1)', () => {
      const index1: { [k: string]: dataIndexColumnValueType } = { column1: 1 };
      const index2: { [k: string]: dataIndexColumnValueType } = { column1: 1, column2: 'text' };
      const result = equalIndexColumns(index1, index2);

      expect(result).toBe(false);
    });

    /**
     *
     */
    test('it should be return true when the equalIndexColumns() is called with difference objects (2)', () => {
      const index1: { [k: string]: dataIndexColumnValueType } = { column1: 1, column3: 'text' };
      const index2: { [k: string]: dataIndexColumnValueType } = { column1: 1, column2: 'text' };
      const result = equalIndexColumns(index1, index2);

      expect(result).toBe(false);
    });
  });
});
