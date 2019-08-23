import { columnMainEvaluation, columnMainQuestions } from './columnMain';

import { dataColumnType } from '../../types';

const names = ['name1', 'name2'] as const;
const blacklist = ['_id'] as const;

const choiceItems = [
  { name: 'String', short: 'String', value: 'string' },
  { name: 'Number', short: 'Number', value: 'number' },
  { name: 'Date', short: 'Date', value: 'date' },
  { name: 'Boolean', short: 'Boolean', value: 'boolean' },
  { name: 'ObjectId', short: 'ObjectId', value: 'objectId' },
  { name: 'Decimal128', short: 'Decimal128', value: 'decimal' },
  { name: 'Buffer', short: 'Buffer', value: 'buffer' },
  { name: 'Mixed', short: 'Mixed', value: 'mixed' },
  { name: 'Array<Type>', short: 'Array<Type>', value: 'arrayType' },
  { name: 'Array<Object>', short: 'Array<Object>', value: 'array' },
  { name: 'Object', short: 'Object', value: 'object' },
  { name: 'Map', short: 'Map', value: 'map' },
  { name: '2dsphere', short: '2dsphere', value: '2dsphere' },
] as const;

/**
 *
 */
describe('Check the columnMain functions', () => {
  /**
   *
   */
  describe('Check the columnMainQuestions()', () => {
    /**
     *
     */
    test('it should be return choices when the function is called without column', () => {
      const result = columnMainQuestions(undefined, names, blacklist);

      expect(result).toEqual([
        {
          message: 'Column name:',
          name: 'name',
          type: 'input',
          validate: expect.any(Function),
        },
        {
          choices: choiceItems,
          message: 'Choose a SchemaType:',
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
      const column: dataColumnType = {
        name: 'testColumn',
        type: 'buffer',
        required: true,
      };

      const result = columnMainQuestions(column);

      expect(result).toEqual([
        {
          default: 'testColumn',
          message: 'Column name:',
          name: 'name',
          type: 'input',
          validate: expect.any(Function),
        },
        {
          default: 6,
          choices: choiceItems,
          message: 'Choose a SchemaType:',
          name: 'type',
          type: 'list',
          when: expect.any(Function),
        },
      ]);
    });

    /**
     *
     */
    test('it should be return true when validate() is called with an unknown name (from first question)', () => {
      const questions = columnMainQuestions(undefined, names, blacklist);

      const validate = questions[0].validate;

      expect(validate).toEqual(expect.any(Function));

      const result = validate('nameUnknown');

      expect(result).toBe(true);
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called with a duplicate name (from first question)', () => {
      const questions = columnMainQuestions(undefined, names, blacklist);

      const validate = questions[0].validate;

      expect(validate).toEqual(expect.any(Function));

      const result = validate('name2');

      expect(result).toBe('A column with the name already exists!');
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called with a invalid name (from first question)', () => {
      const questions = columnMainQuestions(undefined, names, blacklist);

      const validate = questions[0].validate;

      expect(validate).toEqual(expect.any(Function));

      const result = validate('_Test.hello_');

      expect(result).toBe(
        'Only letters, numbers and hyphens are allowed and the first character must be a small letter! (RegExp: ^[a-z](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$|^$)',
      );
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called with a blacklisted name (from first question)', () => {
      const questions = columnMainQuestions(undefined, names, blacklist);

      const validate = questions[0].validate;

      expect(validate).toEqual(expect.any(Function));

      const result = validate('_id');

      expect(result).toBe('This column is created automatically!');
    });

    /**
     *
     */
    test('it should be return a error message when validate() is called without name (from first question)', () => {
      const questions = columnMainQuestions(undefined, names, blacklist);

      const validate = questions[0].validate;

      expect(validate).toEqual(expect.any(Function));

      const result = validate('');

      expect(result).toBe(true);
    });

    /**
     *
     */
    test('it should be return true when when() is called with name (from second question)', () => {
      const questions = columnMainQuestions(undefined, names, blacklist);

      const when = questions[1].when;

      expect(when).toEqual(expect.any(Function));

      const result = when({ name: 'testName' });

      expect(result).toBe(true);
    });

    /**
     *
     */
    test('it should be return false when when() is called without name (from second question)', () => {
      const questions = columnMainQuestions(undefined, names, blacklist);

      const when = questions[1].when;

      expect(when).toEqual(expect.any(Function));

      const result = when({ name: '' });

      expect(result).toBe(false);
    });
  });

  /**
   *
   */
  describe('Check the columnMainEvaluation()', () => {
    /**
     *
     */
    test('it should be create column object when the function is called without index', () => {
      const result = columnMainEvaluation(undefined, { name: 'name5', type: 'number' });

      expect(result).toEqual({ name: 'name5', type: 'number' });
    });

    /**
     *
     */
    test('it should be update column object when the function is called with index', () => {
      const column: dataColumnType = { name: 'name95', type: 'number', required: true };

      const result = columnMainEvaluation(column, { name: 'name', type: 'string' });

      expect(result).toBe(column);
      expect(result.name).toBe('name');
      expect(result.type).toBe('string');
    });
  });
});
