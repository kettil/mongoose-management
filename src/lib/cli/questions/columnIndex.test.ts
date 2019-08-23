import {
  columnIndexAnswersType,
  columnIndexEvaluation,
  columnIndexQuestions,
  getIndexName,
  getIndexProperties,
} from './columnIndex';

import { dataColumnType, dataIndexType, schemaIndexType } from '../../types';

const choicesType = [1, -1, 'text', 'hashed'];
const choicesName = [
  { name: 'No index', short: 'No index', value: 'no' },
  { name: 'Index', short: 'Index', value: 'index' },
  { name: 'Unique index', short: 'Unique index', value: 'unique' },
  { name: 'Sparse index', short: 'Sparse index', value: 'sparse' },
];

/**
 *
 */
describe('Check the columnIndex functions', () => {
  /**
   *
   */
  describe('Check the columnIndexQuestions()', () => {
    /**
     *
     */
    test('it should be return choices when the function is called without column', () => {
      const result = columnIndexQuestions(undefined);

      expect(result).toEqual([
        {
          choices: choicesName,
          message: 'Choose a index',
          name: 'mode',
          type: 'list',
        },
        {
          choices: choicesType,
          message: 'Choose a index type',
          name: 'type',
          type: 'list',
          when: expect.any(Function),
        },
      ]);
    });

    /**
     *
     */
    test('it should be return choices when the function is called with column', () => {
      const index: dataIndexType = {
        name: 'testIndex',
        columns: {},
        properties: {},
        mode: 'unique',
        type: -1,
      };

      const result = columnIndexQuestions(index);

      expect(result).toEqual([
        {
          name: 'mode',
          type: 'list',
          message: 'Choose a index',
          choices: choicesName,
          default: 2,
        },
        {
          name: 'type',
          type: 'list',
          message: 'Choose a index type',
          choices: choicesType,
          default: 1,
          when: expect.any(Function),
        },
      ]);
    });

    /**
     *
     */
    test('it should be return true when when() is called with mode (from second question)', () => {
      const questions = columnIndexQuestions(undefined);

      const when = questions[1].when;

      expect(when).toEqual(expect.any(Function));

      const result = when({ mode: 'index' });

      expect(result).toBe(true);
    });

    /**
     *
     */
    test('it should be return false when when() is called without mode (from second question)', () => {
      const questions = columnIndexQuestions(undefined);

      const when = questions[1].when;

      expect(when).toEqual(expect.any(Function));

      const result = when({ mode: undefined });

      expect(result).toBe(false);
    });
  });

  /**
   *
   */
  describe('Check the columnIndexEvaluation()', () => {
    /**
     *
     */
    test('it should be add an index when the function is called without index and mode is "unique"', () => {
      const column: dataColumnType = { name: 'columnName', type: 'date' };
      const answers: columnIndexAnswersType = { mode: 'unique', type: 'text' };
      const indexes: dataIndexType[] = [
        { name: 'name1', columns: { c1: 1, c2: 'text' }, properties: {} },
        { name: 'name2', columns: { c2: 'text' }, properties: { unique: true } },
      ];

      columnIndexEvaluation(column, answers, indexes);

      expect(indexes.length).toBe(3);
      expect(indexes).toEqual([
        { name: 'name1', columns: { c1: 1, c2: 'text' }, properties: {} },
        { name: 'name2', columns: { c2: 'text' }, properties: { unique: true } },
        {
          name: 'columnName-unique_',
          columns: { columnName: 'text' },
          properties: { unique: true },
          readonly: true,
          mode: 'unique',
          type: 'text',
        },
      ]);
    });

    /**
     *
     */
    test('it should be remove an index when the function is called without index and mode is "no"', () => {
      const column: dataColumnType = { name: 'columnName', type: 'date' };
      const answers: columnIndexAnswersType = { mode: 'no', type: 'text' };
      const indexes: dataIndexType[] = [
        { name: 'name1', columns: { c1: 1, c2: 'text' }, properties: {} },
        { name: 'name2', columns: { c2: 'text' }, properties: { unique: true } },
      ];

      columnIndexEvaluation(column, answers, indexes);

      expect(indexes.length).toBe(2);
      expect(indexes).toEqual([
        { name: 'name1', columns: { c1: 1, c2: 'text' }, properties: {} },
        { name: 'name2', columns: { c2: 'text' }, properties: { unique: true } },
      ]);
    });

    /**
     *
     */
    test('it should be add an index when the function is called with index and mode is "unique"', () => {
      const column: dataColumnType = { name: 'columnName', type: 'date' };
      const answers: columnIndexAnswersType = { mode: 'unique', type: 'text' };
      const indexes: dataIndexType[] = [
        { name: 'name1', columns: { c1: 1, c2: 'text' }, properties: {} },
        { name: 'name2', columns: { c2: 'text' }, properties: { unique: true } },
      ];

      columnIndexEvaluation(column, answers, indexes, indexes[0]);

      expect(indexes.length).toBe(2);
      expect(indexes).toEqual([
        {
          name: 'columnName-unique_',
          columns: { columnName: 'text' },
          properties: { unique: true },
          readonly: true,
          mode: 'unique',
          type: 'text',
        },
        { name: 'name2', columns: { c2: 'text' }, properties: { unique: true } },
      ]);
    });

    /**
     *
     */
    test('it should be remove an index when the function is called with index and mode is "no"', () => {
      const column: dataColumnType = { name: 'columnName', type: 'date' };
      const answers: columnIndexAnswersType = { mode: 'no', type: 'text' };
      const indexes: dataIndexType[] = [
        { name: 'name1', columns: { c1: 1, c2: 'text' }, properties: {} },
        { name: 'name2', columns: { c2: 'text' }, properties: { unique: true } },
      ];

      columnIndexEvaluation(column, answers, indexes, indexes[1]);

      expect(indexes.length).toBe(2);
      expect(indexes).toEqual([{ name: 'name1', columns: { c1: 1, c2: 'text' }, properties: {} }, undefined]);
    });

    /**
     *
     */
    test('it should be nothing when the function is called without index and column type is "2dsphere"', () => {
      const column: dataColumnType = { name: 'columnName', type: '2dsphere' };
      const answers: columnIndexAnswersType = { mode: 'unique', type: 'text' };
      const indexes: dataIndexType[] = [
        { name: 'name1', columns: { c1: 1, c2: 'text' }, properties: {} },
        { name: 'name2', columns: { c2: 'text' }, properties: { unique: true } },
      ];

      columnIndexEvaluation(column, answers, indexes);

      expect(indexes.length).toBe(2);
      expect(indexes).toEqual([
        { name: 'name1', columns: { c1: 1, c2: 'text' }, properties: {} },
        { name: 'name2', columns: { c2: 'text' }, properties: { unique: true } },
      ]);
    });
  });

  /**
   *
   */
  describe('Check the helper functions', () => {
    /**
     *
     */
    test('it should be return index name when the getIndexName() is called', () => {
      const name = getIndexName('columeName', 'unique', 'prefix.');

      expect(name).toBe('prefix.columeName-unique_');
    });

    const testValuesGetIndexProperties: Array<[schemaIndexType, {}]> = [
      ['no', {}],
      ['index', {}],
      ['sparse', { sparse: true }],
      ['unique', { unique: true }],
    ];

    /**
     *
     */
    test.each(testValuesGetIndexProperties)(
      'it should be return properties when the getIndexProperties() is called with mode "%s"',
      (mode, expected) => {
        const properties = getIndexProperties(mode);

        expect(properties).toEqual(expected);
      },
    );
  });
});
