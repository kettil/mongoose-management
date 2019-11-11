import Prompts, { regexpNameMessage } from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import { CancelPromptError } from '../errors';

import { call, evaluation, getQuestions, validateName, whenType } from './columnMain';

const mockCall = jest.fn();

describe('Check the prompts columnMain functions', () => {
  let prompts: Prompts;
  let choices: any[];
  let collection: CollectionDataset;
  let column: ColumnDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;
    choices = [
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
    ];

    collection = new CollectionDataset(
      {
        name: 'collectionName',
        columns: [{ name: 'column1', type: 'string' }],
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
      expect(questions).toEqual([
        { default: 'column1', message: 'Column name:', name: 'name', type: 'input', validate: expect.any(Function) },
        {
          choices,
          default: 0,
          message: 'Choose a SchemaType:',
          name: 'type',
          type: 'list',
          when: expect.any(Function),
        },
      ]);

      return { name: 'newColumnName', type: 'number' };
    });

    expect(column).toBeInstanceOf(ColumnDataset);

    const result = await call(prompts, collection, column);

    expect(result).toEqual({ name: 'newColumnName', type: 'number' });
    expect(prompts.call).toHaveBeenCalledTimes(1);
  });

  test('it should be throw an error when call() is called and name is empty', async () => {
    expect.assertions(4);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        { default: 'column1', message: 'Column name:', name: 'name', type: 'input', validate: expect.any(Function) },
        {
          choices,
          default: 0,
          message: 'Choose a SchemaType:',
          name: 'type',
          type: 'list',
          when: expect.any(Function),
        },
      ]);

      return { name: '', type: 'number' };
    });

    try {
      await call(prompts, collection, column);
    } catch (err) {
      expect(err).toBeInstanceOf(CancelPromptError);
      expect(err.message).toBe('cancel');

      expect(prompts.call).toHaveBeenCalledTimes(1);
    }
  });

  test('it should be return the questions array then getQuestions() is called without column', () => {
    const result = getQuestions(collection);

    expect(result).toEqual([
      { message: 'Column name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices,
        message: 'Choose a SchemaType:',
        name: 'type',
        type: 'list',
        when: expect.any(Function),
      },
    ]);
  });

  test('it should be return the questions array then getQuestions() is called with column', () => {
    const result = getQuestions(collection, column);

    expect(result).toEqual([
      { default: 'column1', message: 'Column name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices,
        default: 0,
        message: 'Choose a SchemaType:',
        name: 'type',
        type: 'list',
        when: expect.any(Function),
      },
    ]);
  });

  test('it should be return the questions array then getQuestions() is called and parent is a ColumnDataset', () => {
    const result = getQuestions(column);

    expect(result).toEqual([
      { message: 'Column name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices,

        message: 'Choose a SchemaType:',
        name: 'type',
        type: 'list',
        when: expect.any(Function),
      },
    ]);
  });

  test('it should be return the column when evaluation() is called without column', () => {
    const closure = evaluation({ name: 'newColumn', type: 'array' }, collection, collection);

    expect(closure).toEqual(expect.any(Function));

    const result = closure();

    expect(result).toBeInstanceOf(ColumnDataset);
    expect(collection.getObject()).toEqual({
      columns: [
        { name: 'column1', type: 'string', subColumns: undefined, subTypes: undefined },
        { name: 'newColumn', type: 'array', subColumns: [], subTypes: undefined },
      ],
      indexes: [],
      name: 'collectionName',
    });
  });

  test('it should be return the column when evaluation() is called with column', () => {
    const closure = evaluation({ name: 'newColumn', type: 'array' }, collection, collection);

    expect(closure).toEqual(expect.any(Function));

    const result = closure(column);

    expect(result).toBeInstanceOf(ColumnDataset);
    expect(collection.getObject()).toEqual({
      columns: [{ name: 'newColumn', type: 'array', subColumns: [], subTypes: undefined }],
      indexes: [],
      name: 'collectionName',
    });
  });

  test.each<[string, string, string | boolean]>([
    ['true', 'name9  ', true],
    ['string', '_name9', regexpNameMessage],
    ['string', '_id', 'This column is created automatically!'],
    ['string', 'name2', 'A column with the name already exists!'],
  ])('it should be return %s when validateName() is called (%p)', (_, name, expected) => {
    const closure = validateName(['_id'], ['name2', 'name3'], 'name6');

    expect(closure).toEqual(expect.any(Function));

    const result = closure(name);

    expect(result).toEqual(expected);
  });

  test.each<[boolean, string]>([
    [true, 'withName'],
    [false, ''],
    [false, '   '],
  ])('it should be return %p when whenType is called with %p', (expected, name) => {
    const closure = whenType();

    expect(closure).toEqual(expect.any(Function));

    const result = closure({ name });

    expect(result).toEqual(expected);
  });
});
