import { schemaTypes } from '../../mongo';
import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';

import { call, evaluation, getQuestions } from './columnSubType';

const mockCall = jest.fn();

describe('Check the prompts columnSubType functions', () => {
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
      { name: 'UUIDv4', short: 'UUIDv4', value: 'uuidv4' },
      { name: 'Mixed', short: 'Mixed', value: 'mixed' },
      { name: 'Array<Type>', short: 'Array<Type>', value: 'arrayType' },
    ];

    collection = new CollectionDataset(
      {
        name: 'collectionName',
        idType: 'objectId',
        columns: [{ name: 'column1', type: 'arrayType', subTypes: ['arrayType', 'arrayType', 'string'] }],
        indexes: [],
      },
      jest.fn() as any,
    );
    collection.setReference();

    column = collection.getColumn('column1')!;
  });

  test('it should be return the answers when call() is called', async () => {
    expect.assertions(5);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        {
          choices,
          default: 9,
          message: 'Choose a SchemaSubType',
          name: 'type',
          type: 'list',
        },
      ]);

      return { type: 'number' };
    });
    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toEqual([
        {
          choices,
          default: 9,
          message: 'Choose a SchemaSubType',
          name: 'type',
          type: 'list',
        },
      ]);

      return { type: 'arrayType' };
    });

    expect(column).toBeInstanceOf(ColumnDataset);

    const result = await call(prompts, { name: 'columnName', type: 'arrayType' }, column);

    expect(result).toEqual(['arrayType', 'number']);
    expect(prompts.call).toHaveBeenCalledTimes(2);
  });

  test('it should be return the answers when call() is called', async () => {
    expect.assertions(3);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        {
          choices,
          message: 'Choose a SchemaSubType',
          name: 'type',
          type: 'list',
        },
      ]);

      return { type: 'string' };
    });

    const result = await call(prompts, { name: 'columnName', type: 'arrayType' });

    expect(result).toEqual(['string']);
    expect(prompts.call).toHaveBeenCalledTimes(1);
  });

  test.each<[any]>(
    Object.keys(schemaTypes)
      .filter((k) => k !== 'arrayType')
      .map((k) => [k]),
  )('it should be return the answers when call() is called and column type is %p', async (type) => {
    expect.assertions(2);

    const result = await call(prompts, { name: 'columnName', type });

    expect(result).toEqual([]);
    expect(prompts.call).toHaveBeenCalledTimes(0);
  });

  test('it should be return the questions array then getQuestions() is called without subType', () => {
    const result = getQuestions();

    expect(result).toEqual([
      {
        choices,
        message: 'Choose a SchemaSubType',
        name: 'type',
        type: 'list',
      },
    ]);
  });

  test('it should be return the questions array then getQuestions() is called with subType', () => {
    const result = getQuestions('arrayType');

    expect(result).toEqual([
      {
        choices,
        default: 9,
        message: 'Choose a SchemaSubType',
        name: 'type',
        type: 'list',
      },
    ]);
  });

  test('it should be return the column when evaluation() is called', () => {
    const closure = evaluation(['arrayType', 'number']);

    expect(closure).toEqual(expect.any(Function));
    expect(column).toBeInstanceOf(ColumnDataset);

    const result = closure(column);

    expect(result).toBe(column);
    expect(collection.getObject()).toEqual({
      columns: [{ name: 'column1', subTypes: ['arrayType', 'number'], type: 'arrayType' }],
      indexes: [],
      idType: 'objectId',
      name: 'collectionName',
    });
  });
});
