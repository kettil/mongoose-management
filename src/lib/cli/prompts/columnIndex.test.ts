import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';

import { call, evaluation, getQuestions, whenValue } from './columnIndex';

const mockCall = jest.fn();

describe('Check the prompts columnIndex functions', () => {
  let prompts: Prompts;
  let choices: any[];
  let collection: CollectionDataset;
  let column: ColumnDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;
    choices = [
      { name: 'No index', short: 'No index', value: 'no' },
      { name: 'Index', short: 'Index', value: 'index' },
      { name: 'Unique index', short: 'Unique index', value: 'unique' },
      { name: 'Sparse index', short: 'Sparse index', value: 'sparse' },
    ];

    collection = new CollectionDataset(
      {
        name: 'collectionName',
        columns: [{ name: 'column1', type: 'string' }],
        indexes: [{ name: 'column1_', columns: { column1: -1 }, properties: {}, readonly: true }],
      },
      jest.fn() as any,
    );
    collection.setReference();

    column = collection.getColumn('column1')!;
  });

  test('it should be return the answers when call() is called', async () => {
    expect.assertions(3);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        {
          choices,
          default: 1,
          message: 'Choose a index',
          name: 'type',
          type: 'list',
        },
        {
          choices: [1, -1, 'text', 'hashed'],
          default: 1,
          message: 'Choose a index type',
          name: 'value',
          type: 'list',
          when: expect.any(Function),
        },
      ]);

      return { type: 'index', value: 1 };
    });

    const result = await call(prompts, { name: 'columnName', type: 'string' }, column);

    expect(result).toEqual({ type: 'index', value: 1 });
    expect(prompts.call).toHaveBeenCalledTimes(1);
  });

  test('it should be return the answers when call() is called and column type is "2dsphere"', async () => {
    expect.assertions(2);

    const result = await call(prompts, { name: 'columnName', type: '2dsphere' }, column);

    expect(result).toEqual({ type: 'index', value: '2dsphere' });
    expect(prompts.call).toHaveBeenCalledTimes(0);
  });

  test.each<[any]>([['arrayType'], ['array'], ['object'], ['map']])(
    'it should be return the answers when call() is called and column type is %p',
    async (type) => {
      expect.assertions(2);

      const result = await call(prompts, { name: 'columnName', type }, column);

      expect(result).toEqual({ type: 'no' });
      expect(prompts.call).toHaveBeenCalledTimes(0);
    },
  );

  test('it should be return the questions array then getQuestions() is called without column', () => {
    const result = getQuestions();

    expect(result).toEqual([
      {
        choices,
        default: undefined,
        message: 'Choose a index',
        name: 'type',
        type: 'list',
      },
      {
        choices: [1, -1, 'text', 'hashed'],
        default: undefined,
        message: 'Choose a index type',
        name: 'value',
        type: 'list',
        when: expect.any(Function),
      },
    ]);
  });

  test('it should be return the questions array then getQuestions() is called with column', () => {
    const result = getQuestions(column);

    expect(result).toEqual([
      {
        choices,
        default: 1,
        message: 'Choose a index',
        name: 'type',
        type: 'list',
      },
      {
        choices: [1, -1, 'text', 'hashed'],
        default: 1,
        message: 'Choose a index type',
        name: 'value',
        type: 'list',
        when: expect.any(Function),
      },
    ]);
  });

  test('it should be return the column when evaluation() is called', () => {
    const closure = evaluation({ type: 'index', value: 'hashed' });

    expect(closure).toEqual(expect.any(Function));

    const result = closure(column);

    expect(result).toBe(column);
    expect(collection.getObject()).toEqual({
      columns: [{ name: 'column1', type: 'string' }],
      indexes: [
        {
          columns: { column1: 'hashed' },
          name: 'column1_',
          properties: { sparse: undefined, unique: undefined },
          readonly: true,
        },
      ],
      name: 'collectionName',
    });
  });

  test.each<[string, any]>([['with type "no"', { type: 'no', value: 'hashed' }], ['without value', { type: 'index' }]])(
    'it should be return the column and remove the index when evaluation() is called %s',
    (_, answers) => {
      const closure = evaluation(answers);

      expect(closure).toEqual(expect.any(Function));

      const result = closure(column);

      expect(result).toBe(column);
      expect(collection.getObject()).toEqual({
        columns: [{ name: 'column1', type: 'string' }],
        indexes: [],
        name: 'collectionName',
      });
    },
  );

  test.each<[boolean, any]>([[true, 'index'], [true, 'sparse'], [false, 'no'], [false, undefined]])(
    'it should be return %p when whenValue() is called with type %p',
    (expected, type) => {
      const result = whenValue({ type });

      expect(result).toBe(expected);
    },
  );
});
