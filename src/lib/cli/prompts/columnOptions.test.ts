import { schemaTypes } from '../../mongo';
import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';

import {
  call,
  evaluation,
  filterEnum,
  getColumnOptionsTypeAny,
  getColumnOptionsTypeNumber,
  getColumnOptionsTypeString,
  getQuestions,
  validateMax,
  validateMaxLength,
  validateOptions,
  whenCommon,
} from './columnOptions';

const mockCall = jest.fn();

describe('Check the prompts columnOptions functions', () => {
  let prompts: Prompts;

  let collection: CollectionDataset;
  let column: ColumnDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;

    collection = new CollectionDataset(
      {
        name: 'collectionName',
        columns: [
          {
            name: 'column1',
            type: 'string',
            default: 'null',
            enum: '13',
            lowercase: true,
            uppercase: true,
            match: '[a-z]+',
            max: 5,
            min: 2,
            maxLength: 8,
            minLength: 2,
            trim: true,
            required: true,
          },
        ],
        indexes: [],
      },
      jest.fn() as any,
    );
    collection.setReference();

    column = collection.getColumn('column1')!;
  });

  test('it should be return the answers when call() is called', async () => {
    expect.assertions(4);

    mockCall.mockImplementation((questions) => {
      expect(questions).toMatchSnapshot();

      return { options: ['default'], default: "{'a':42}" };
    });

    expect(column).toBeInstanceOf(ColumnDataset);

    const result = await call(prompts, { name: 'columnName', type: 'object' }, column);

    expect(result).toEqual({ options: ['default'], default: "{'a':42}" });
    expect(prompts.call).toHaveBeenCalledTimes(1);
  });

  test('it should be return the questions array then getQuestions() is called without column', () => {
    const result = getQuestions({ name: 'columnName', type: 'string' });

    expect(result).toMatchSnapshot();
  });

  test('it should be return the questions array then getQuestions() is called with column', () => {
    expect(column).toBeInstanceOf(ColumnDataset);

    const result = getQuestions({ name: 'columnName', type: 'string' }, column);

    expect(result).toMatchSnapshot();
  });

  test('it should be return the column when evaluation() is called', () => {
    const closure = evaluation({ options: ['default', 'trim'], default: "{'a':42}" } as any);

    expect(closure).toEqual(expect.any(Function));
    expect(column).toBeInstanceOf(ColumnDataset);

    const result = closure(column);

    expect(result).toBe(column);
    expect(collection.getObject()).toEqual({
      columns: [
        {
          default: "{'a':42}",
          enum: undefined,
          lowercase: undefined,
          match: undefined,
          max: undefined,
          maxLength: undefined,
          min: undefined,
          minLength: undefined,
          name: 'column1',
          required: undefined,
          subColumns: undefined,
          subTypes: undefined,
          trim: true,
          type: 'string',
          uppercase: undefined,
        },
      ],
      indexes: [],
      name: 'collectionName',
    });
  });

  test.each<[any]>(Object.keys(schemaTypes).map((k) => [k]))(
    'it should be return the questions array then getColumnOptionsTypeAny() is called with type %p (without column)',
    (type) => {
      const result = getColumnOptionsTypeAny({ name: 'columnName', type });

      expect(result).toMatchSnapshot();
    },
  );

  test.each<[any]>(Object.keys(schemaTypes).map((k) => [k]))(
    'it should be return the questions array then getColumnOptionsTypeAny() is called with type %p (with column)',
    (type) => {
      expect(column).toBeInstanceOf(ColumnDataset);

      const result = getColumnOptionsTypeAny({ name: 'columnName', type }, column);

      expect(result).toMatchSnapshot();
    },
  );

  test.each<[any]>(Object.keys(schemaTypes).map((k) => [k]))(
    'it should be return the questions array then getColumnOptionsTypeString() is called with type %p (without column)',
    (type) => {
      const result = getColumnOptionsTypeString({ name: 'columnName', type });

      expect(result).toMatchSnapshot();
    },
  );

  test.each<[any]>(Object.keys(schemaTypes).map((k) => [k]))(
    'it should be return the questions array then getColumnOptionsTypeString() is called with type %p (with column)',
    (type) => {
      expect(column).toBeInstanceOf(ColumnDataset);

      const result = getColumnOptionsTypeString({ name: 'columnName', type }, column);

      expect(result).toMatchSnapshot();
    },
  );

  test.each<[any]>(Object.keys(schemaTypes).map((k) => [k]))(
    'it should be return the questions array then getColumnOptionsTypeNumber() is called with type %p (without column)',
    (type) => {
      const result = getColumnOptionsTypeNumber({ name: 'columnName', type });

      expect(result).toMatchSnapshot();
    },
  );

  test.each<[any]>(Object.keys(schemaTypes).map((k) => [k]))(
    'it should be return the questions array then getColumnOptionsTypeNumber() is called with type %p (with column)',
    (type) => {
      expect(column).toBeInstanceOf(ColumnDataset);

      const result = getColumnOptionsTypeNumber({ name: 'columnName', type }, column);

      expect(result).toMatchSnapshot();
    },
  );

  test('it should be return true when whenCommon() is called and the value is in the array', () => {
    const closure = whenCommon('trim');

    expect(closure).toBeInstanceOf(Function);

    const result = closure({ opts: ['a', 'trim', 'b'] });

    expect(result).toBe(true);
  });

  test('it should be return false when whenCommon() is called and the value is not in the array', () => {
    const closure = whenCommon('trim');

    expect(closure).toBeInstanceOf(Function);

    const result = closure({ opts: ['a', 'b'] });

    expect(result).toBe(false);
  });

  test.each([[['a', 'b']], [['lowercase', 'b']], [['a', 'uppercase']], [[]]])(
    'it should be return true when validateOptions() is called with value %p',
    (value) => {
      const result = validateOptions(value);

      expect(result).toBe(true);
    },
  );

  test.each([[['lowercase', 'uppercase']]])(
    'it should be return error message when validateOptions() is called with value %p',
    (value) => {
      const result = validateOptions(value);

      expect(result).toBe('Either "lowercase" or "uppercase" can be selected!');
    },
  );

  test.each<[any]>([[undefined], ['10'], [42]])(
    'it should be return true when validateMaxLength() is called with value %p',
    (value) => {
      const result = validateMaxLength(value, { minLength: '5' });

      expect(result).toBe(true);
    },
  );

  test.each<[any]>([['2'], [1]])(
    'it should be return error message when validateMaxLength() is called with value %p',
    (value) => {
      const result = validateMaxLength(value, { minLength: '5' });

      expect(result).toBe('Length must be greater or equal than to minimum length (>= 5)!');
    },
  );

  test.each<[any]>([[undefined], ['10'], [42]])(
    'it should be return true when validateMax() is called with value %p',
    (value) => {
      const result = validateMax(value, { min: '5' });

      expect(result).toBe(true);
    },
  );

  test.each<[any]>([['2'], [1]])(
    'it should be return error message when validateMax() is called with value %p',
    (value) => {
      const result = validateMax(value, { min: '13' });

      expect(result).toBe('Value must be greater or equal than to minimum value (>= 13)!');
    },
  );

  test('it should be return adjusted value when filterEnum() is called', () => {
    const result = filterEnum('a,b;   c     ;; ,;');

    expect(result).toBe('a,b; c; ,');
  });
});
