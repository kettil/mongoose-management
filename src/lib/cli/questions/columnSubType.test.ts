import { columnSubTypeAnswersType, columnSubTypeEvaluation, columnSubTypeQuestions } from './columnSubType';

import { dataColumnType } from '../../types';

const choices = [
  { name: 'String', short: 'String', value: 'string' },
  { name: 'Number', short: 'Number', value: 'number' },
  { name: 'Date', short: 'Date', value: 'date' },
  { name: 'Boolean', short: 'Boolean', value: 'boolean' },
  { name: 'ObjectId', short: 'ObjectId', value: 'objectId' },
  { name: 'Decimal128', short: 'Decimal128', value: 'decimal' },
  { name: 'Buffer', short: 'Buffer', value: 'buffer' },
  { name: 'Mixed', short: 'Mixed', value: 'mixed' },
  { name: 'Array<Type>', short: 'Array<Type>', value: 'arrayType' },
];

/**
 *
 */
describe('Check the columnSubType functions', () => {
  /**
   *
   */
  describe('Check the columnSubTypeQuestions()', () => {
    /**
     *
     */
    test('it should be return choices when the function is called with column without subType', () => {
      const column: dataColumnType = { name: 'columnName', type: 'arrayType' };

      const result = columnSubTypeQuestions(column);

      expect(result).toEqual([
        {
          choices,
          default: undefined,
          message: 'Choose a SchemaSubType',
          name: 'type',
          type: 'list',
        },
      ]);
    });

    /**
     *
     */
    test('it should be return choices when the function is called with column with subType', () => {
      const column: dataColumnType = { name: 'columnName', type: 'arrayType', subType: { type: 'number' } };

      const result = columnSubTypeQuestions(column);

      expect(result).toEqual([
        {
          choices,
          default: 1,
          message: 'Choose a SchemaSubType',
          name: 'type',
          type: 'list',
        },
      ]);
    });
  });

  /**
   *
   */
  describe('Check the columnSubTypeEvaluation()', () => {
    /**
     *
     */
    test('it should be add an index when the function is called without subType object', () => {
      const column: dataColumnType = { name: 'columnName', type: 'arrayType' };
      const answers: columnSubTypeAnswersType = { type: 'string' };

      columnSubTypeEvaluation(column, answers);

      expect(column).toEqual({
        name: 'columnName',
        subType: {
          type: 'string',
        },
        type: 'arrayType',
      });
    });

    /**
     *
     */
    test('it should be add an index when the function is called with subType object', () => {
      const column: dataColumnType = { name: 'columnName', type: 'arrayType', subType: { type: 'string' } };
      const answers: columnSubTypeAnswersType = { type: 'number' };

      columnSubTypeEvaluation(column, answers);

      expect(column).toEqual({
        name: 'columnName',
        subType: {
          type: 'number',
        },
        type: 'arrayType',
      });
    });
  });
});
