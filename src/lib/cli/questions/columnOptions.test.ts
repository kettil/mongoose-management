import {
  columnOptionsEvaluation,
  columnOptionsQuestions,
  getColumnOptionsTypeNumber,
  getColumnOptionsTypeSpecial,
  getColumnOptionsTypeString,
} from './columnOptions';

import { schemaTypes } from '../../mongo';
import { dataColumnType, schemaType } from '../../types';

const types = Object.keys(schemaTypes) as schemaType[];

/**
 *
 */
describe('Check the columnOptions functions', () => {
  /**
   *
   */
  describe('Check the columnOptionsQuestions()', () => {
    /**
     *
     */
    test.each(types)(
      'it should be return choices when the function is called with minimum on settings (type "%s")',
      (type) => {
        const column: dataColumnType = {
          name: 'columnName',
          type,
        };

        const result = columnOptionsQuestions(column);

        expect(result).toMatchSnapshot();
      },
    );

    /**
     *
     */
    test.each(types)(
      'it should be return choices when the function is called with maximum on settings (type "%s")',
      (type) => {
        const column: dataColumnType = {
          name: 'columnName',
          type,
          required: true,
          default: 'defaultText',
          trim: true,
          lowercase: true,
          uppercase: true,
          match: '^[a-zA-Z0-9]+$',
          enum: 'hello; bye',
          minLength: 1,
          maxLength: 10,
          min: 1,
          max: 10,
        };

        const result = columnOptionsQuestions(column);

        expect(result).toMatchSnapshot();
      },
    );

    const datasetValidate: Array<[string, schemaType, any[], any[]]> = [
      ['options', 'string', [[]], [['lowercase', 'uppercase']]],
      ['maxLength', 'string', ['4', {}], ['6', { minLength: 8 }]],
      ['max', 'number', ['7', {}], ['1', { min: 3 }]],
    ];

    const datasetWhen: Array<[string, schemaType, string[], string[]]> = [
      ['default', 'string', ['requierd', 'default', 'enum'], ['requierd', 'enum']],
      ['enum', 'string', ['requierd', 'default', 'enum'], ['requierd', 'default']],
      ['match', 'string', ['match', 'default', 'enum'], ['requierd', 'default']],
      ['minLength', 'string', ['match', 'minLength', 'enum'], ['requierd', 'default']],
      ['maxLength', 'string', ['match', 'maxLength', 'enum'], ['requierd', 'default']],
      ['min', 'number', ['match', 'min', 'enum'], ['requierd', 'default']],
      ['max', 'number', ['match', 'max', 'enum'], ['requierd', 'default']],
    ];

    /**
     *
     */
    describe('Check the validate()', () => {
      /**
       *
       */
      test.each(datasetValidate)(
        'it should be return true when funcs is called with correct values (from "%s" question)',
        (name, type, itemsWithin) => {
          const column: dataColumnType = {
            name: 'columnName',
            type,
          };

          const questions = columnOptionsQuestions(column).filter((q) => q.name === name);
          expect(questions.length).toBe(1);

          const validate = questions[0].validate;
          expect(typeof validate).toBe('function');

          const result = validate(...itemsWithin);

          expect(result).toBe(true);
        },
      );

      /**
       *
       */
      test.each(datasetValidate)(
        'it should be return a error message when funcs is called with wrong values (from "%s" question)',
        (name, type, _, itemsWithout) => {
          const column: dataColumnType = {
            name: 'columnName',
            type,
          };

          const questions = columnOptionsQuestions(column).filter((q) => q.name === name);
          expect(questions.length).toBe(1);

          const validate = questions[0].validate;
          expect(typeof validate).toBe('function');

          const result = validate(...itemsWithout);

          expect(result).toEqual(expect.any(String));
        },
      );
    });

    /**
     *
     */
    describe('Check the when()', () => {
      /**
       *
       */
      test.each(datasetWhen)(
        'it should be return true when funcs is called with selected item (from "%s" question)',
        (name, type, itemsWithin) => {
          const column: dataColumnType = {
            name: 'columnName',
            type,
          };

          const questions = columnOptionsQuestions(column).filter((q) => q.name === name);
          expect(questions.length).toBe(1);

          const when = questions[0].when;
          expect(typeof when).toBe('function');

          const result = when({ options: itemsWithin });

          expect(result).toBe(true);
        },
      );

      /**
       *
       */
      test.each(datasetWhen)(
        'it should be return false when funcs is called without selected item (from "%s" question)',
        (name, type, _, itemsWithout) => {
          const column: dataColumnType = {
            name: 'columnName',
            type,
          };

          const questions = columnOptionsQuestions(column).filter((q) => q.name === name);
          expect(questions.length).toBe(1);

          const when = questions[0].when;
          expect(typeof when).toBe('function');

          const result = when({ options: itemsWithout });

          expect(result).toBe(false);
        },
      );
    });

    /**
     *
     */
    describe('Check the filter()', () => {
      /**
       *
       */
      test('it should be return adjusted value when funcs is called (from "enum" question)', () => {
        const column: dataColumnType = {
          name: 'columnName',
          type: 'string',
        };

        const questions = columnOptionsQuestions(column).filter((q) => q.name === 'enum');
        expect(questions.length).toBe(1);

        const filter = questions[0].filter;
        expect(typeof filter).toBe('function');

        const result = filter('word1   ; word2;word3');

        expect(result).toBe('word1; word2; word3');
      });
    });
  });

  /**
   *
   */
  describe('Check the columnOptionsEvaluation()', () => {
    /**
     *
     */
    test('it should be update column object when the function is called with empty options list', () => {
      const column: dataColumnType = { name: 'columnName', type: 'date' };

      columnOptionsEvaluation(column, { options: [] });

      expect(column).toEqual({ name: 'columnName', type: 'date' });
    });

    /**
     *
     */
    test('it should be update column object when the function is called with options "required", "enum"', () => {
      const column: dataColumnType = { name: 'columnName', type: 'string' };

      columnOptionsEvaluation(column, { options: ['required', 'enum'], required: true, enum: 'word1; word2' });

      expect(column).toEqual({ name: 'columnName', type: 'string', required: true, enum: 'word1; word2' });
    });

    /**
     *
     */
    test('it should be update column object when the function is called with options "default", "min"', () => {
      const column: dataColumnType = { name: 'columnName', type: 'number' };

      columnOptionsEvaluation(column, { options: ['default', 'min'], default: '0', min: 0 });

      expect(column).toEqual({ name: 'columnName', type: 'number', default: '0', min: 0 });
    });
  });

  /**
   *
   */
  describe('Check the helper functions', () => {
    /**
     *
     */
    test('it should be return choices when the getColumnOptionsTypeSpecial() is called with type "arrayType"', () => {
      const column: dataColumnType = {
        name: 'columnName',
        type: 'arrayType',
      };

      const choices = getColumnOptionsTypeSpecial(column);

      expect(choices).toEqual([]);
    });

    /**
     *
     */
    test('it should be return choices when the getColumnOptionsTypeSpecial() is called with type "arrayType" and without options', () => {
      const column: dataColumnType = {
        name: 'columnName',
        type: 'string',
      };

      const choices = getColumnOptionsTypeSpecial(column);

      expect(choices).toEqual([
        { checked: false, name: 'required', short: 'required', value: 'required' },
        { checked: false, name: 'default', short: 'default', value: 'default' },
      ]);
    });

    /**
     *
     */
    test('it should be return choices when the getColumnOptionsTypeSpecial() is called with type "arrayType" and with options', () => {
      const column: dataColumnType = {
        name: 'columnName',
        type: 'string',
        required: true,
        default: 'example',
      };

      const choices = getColumnOptionsTypeSpecial(column);

      expect(choices).toEqual([
        { checked: true, name: 'required', short: 'required', value: 'required' },
        { checked: true, name: 'default', short: 'default', value: 'default' },
      ]);
    });

    /**
     *
     */
    test('it should be return choices when the getColumnOptionsTypeString() is called with type "objectId"', () => {
      const column: dataColumnType = {
        name: 'columnName',
        type: 'objectId',
      };

      const choices = getColumnOptionsTypeString(column);

      expect(choices).toEqual([]);
    });

    /**
     *
     */
    test('it should be return choices when the getColumnOptionsTypeString() is called with type "string" and without options', () => {
      const column: dataColumnType = {
        name: 'columnName',
        type: 'string',
      };

      const choices = getColumnOptionsTypeString(column);

      expect(choices).toEqual([
        { checked: false, name: 'enum', short: 'enum', value: 'enum' },
        { checked: false, name: 'match (regexp)', short: 'match', value: 'match' },
        { checked: false, name: 'trim', short: 'trim', value: 'trim' },
        { checked: false, name: 'lowercase', short: 'lowercase', value: 'lowercase' },
        { checked: false, name: 'uppercase', short: 'uppercase', value: 'uppercase' },
        { checked: false, name: 'minLength', short: 'minLength', value: 'minLength' },
        { checked: false, name: 'maxLength', short: 'maxLength', value: 'maxLength' },
      ]);
    });

    /**
     *
     */
    test('it should be return choices when the getColumnOptionsTypeString() is called with type "string" and with options', () => {
      const column: dataColumnType = {
        name: 'columnName',
        type: 'string',
        trim: true,
        lowercase: true,
        uppercase: true,
        match: '^[a-zA-Z0-9]+$',
        enum: 'hello; bye',
        minLength: 1,
        maxLength: 10,
      };

      const choices = getColumnOptionsTypeString(column);

      expect(choices).toEqual([
        { checked: true, name: 'enum', short: 'enum', value: 'enum' },
        { checked: true, name: 'match (regexp)', short: 'match', value: 'match' },
        { checked: true, name: 'trim', short: 'trim', value: 'trim' },
        { checked: true, name: 'lowercase', short: 'lowercase', value: 'lowercase' },
        { checked: true, name: 'uppercase', short: 'uppercase', value: 'uppercase' },
        { checked: true, name: 'minLength', short: 'minLength', value: 'minLength' },
        { checked: true, name: 'maxLength', short: 'maxLength', value: 'maxLength' },
      ]);
    });

    /**
     *
     */
    test('it should be return choices when the getColumnOptionsTypeNumber() is called with type "string"', () => {
      const column: dataColumnType = {
        name: 'columnName',
        type: 'string',
      };

      const choices = getColumnOptionsTypeNumber(column);

      expect(choices).toEqual([]);
    });

    /**
     *
     */
    test('it should be return choices when the getColumnOptionsTypeNumber() is called with type "number" and without options', () => {
      const column: dataColumnType = {
        name: 'columnName',
        type: 'number',
      };

      const choices = getColumnOptionsTypeNumber(column);

      expect(choices).toEqual([
        { checked: false, name: 'min', short: 'min', value: 'min' },
        { checked: false, name: 'max', short: 'max', value: 'max' },
      ]);
    });

    /**
     *
     */
    test.each([[0, 0], [1, 5]])(
      'it should be return choices when the getColumnOptionsTypeNumber() is called with type "number" and with options [%p,%p]',
      (min, max) => {
        const column: dataColumnType = {
          name: 'columnName',
          type: 'number',
          min,
          max,
        };

        const choices = getColumnOptionsTypeNumber(column);

        expect(choices).toEqual([
          { checked: true, name: 'min', short: 'min', value: 'min' },
          { checked: true, name: 'max', short: 'max', value: 'max' },
        ]);
      },
    );
  });
});
