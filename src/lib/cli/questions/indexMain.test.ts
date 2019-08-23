import { indexMainEvaluation, indexMainQuestions } from './indexMain';

import { dataColumnType, dataIndexType } from '../../types';

/**
 *
 */
describe('Check the indexMain functions', () => {
  let indexes: dataIndexType[];
  let columns: dataColumnType[];

  /**
   *
   */
  beforeEach(() => {
    indexes = [
      { name: 'index1', columns: { column1: 1 }, properties: {} },
      { name: 'index2', columns: { column3: 'text' }, properties: {} },
    ];

    columns = [
      { name: 'column1', type: 'string' },
      { name: 'column2', type: 'string' },
      { name: 'column3', type: 'string' },
    ];
  });

  /**
   *
   */
  describe('Check the indexMainQuestions()', () => {
    /**
     *
     */
    test('it should be return choices when the function is called with without index', () => {
      const result = indexMainQuestions(undefined, indexes, columns);

      expect(result).toEqual([
        {
          default: undefined,
          message: 'Index name:',
          name: 'name',
          type: 'input',
          validate: expect.any(Function),
        },
        {
          choices: [
            { checked: false, disabled: false, name: 'column1', short: 'column1', value: 'column1' },
            { checked: false, disabled: false, name: 'column2', short: 'column2', value: 'column2' },
            { checked: false, disabled: false, name: 'column3', short: 'column3', value: 'column3' },
            { checked: false, disabled: false, name: 'createdAt', short: 'createdAt', value: 'createdAt' },
            { checked: false, disabled: false, name: 'updatedAt', short: 'updatedAt', value: 'updatedAt' },
            { checked: false, disabled: false, name: '_id', short: '_id', value: '_id' },
          ],
          message: 'Choose a columns:',
          name: 'columns',
          type: 'checkbox',
          when: expect.any(Function),
        },
      ]);
    });

    /**
     *
     */
    test('it should be return choices when the function is called with without index', () => {
      const result = indexMainQuestions(indexes[1], indexes, columns);

      expect(result).toEqual([
        {
          default: 'index2',
          message: 'Index name:',
          name: 'name',
          type: 'input',
          validate: expect.any(Function),
        },
        {
          choices: [
            { checked: false, disabled: false, name: 'column1', short: 'column1', value: 'column1' },
            { checked: false, disabled: false, name: 'column2', short: 'column2', value: 'column2' },
            { checked: true, disabled: false, name: 'column3', short: 'column3', value: 'column3' },
            { checked: false, disabled: false, name: 'createdAt', short: 'createdAt', value: 'createdAt' },
            { checked: false, disabled: false, name: 'updatedAt', short: 'updatedAt', value: 'updatedAt' },
            { checked: false, disabled: false, name: '_id', short: '_id', value: '_id' },
          ],
          message: 'Choose a columns:',
          name: 'columns',
          type: 'checkbox',
          when: expect.any(Function),
        },
      ]);
    });

    /**
     *
     */
    test('it should be return true when validate() is called with correct name (from "name" question)', () => {
      const questions = indexMainQuestions(indexes[1], indexes, columns).filter((q) => q.name === 'name');
      expect(questions.length).toBe(1);

      const validate = questions[0].validate;
      expect(typeof validate).toBe('function');

      const result = validate('index5');

      expect(result).toBe(true);
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called with duplicate index name (from "name" question)', () => {
      const questions = indexMainQuestions(indexes[1], indexes, columns).filter((q) => q.name === 'name');
      expect(questions.length).toBe(1);

      const validate = questions[0].validate;
      expect(typeof validate).toBe('function');

      const result = validate('index1');

      expect(result).toEqual('A index with the name already exists!');
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called with wrong index name (from "name" question)', () => {
      const questions = indexMainQuestions(indexes[1], indexes, columns).filter((q) => q.name === 'name');
      expect(questions.length).toBe(1);

      const validate = questions[0].validate;
      expect(typeof validate).toBe('function');

      const result = validate('indes_');

      expect(result).toEqual(
        'Only letters, numbers and hyphens are allowed and the first character must be a small letter! (RegExp: ^[a-z](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$|^$)',
      );
    });

    /**
     *
     */
    test('it should be return true when when() is called with name (from "columns" question)', () => {
      const questions = indexMainQuestions(indexes[1], indexes, columns).filter((q) => q.name === 'columns');
      expect(questions.length).toBe(1);

      const when = questions[0].when;
      expect(typeof when).toBe('function');

      const result = when({ name: 'indexName' });

      expect(result).toBe(true);
    });

    /**
     *
     */
    test('it should be return false when when() is called with empty value (from "columns" question)', () => {
      const questions = indexMainQuestions(indexes[1], indexes, columns).filter((q) => q.name === 'columns');
      expect(questions.length).toBe(1);

      const when = questions[0].when;
      expect(typeof when).toBe('function');

      const result = when({ name: '' });

      expect(result).toBe(false);
    });
  });

  /**
   *
   */
  describe('Check the indexMainEvaluation()', () => {
    /**
     *
     */
    test('it should be create column object when the function is called without group', () => {
      const result = indexMainEvaluation(undefined, { name: 'newIndex', columns: ['column2', 'column3'] });

      expect(result).toEqual({ name: 'newIndex', columns: {}, properties: {} });
    });

    /**
     *
     */
    test('it should be update column object when the function is called with group', () => {
      const index: dataIndexType = { name: 'oldIndex', columns: {}, properties: {} };

      const result = indexMainEvaluation(index, { name: 'newIndex', columns: ['column2', 'column3'] });

      expect(result).toBe(index);
      expect(result.name).toBe('newIndex');
    });
  });
});
