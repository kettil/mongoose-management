import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import IndexDataset from '../dataset/index';

import { call, equalIndexColumns, evaluation, getQuestions, normalizer } from './indexColumns';

const mockCall = jest.fn();

describe('Check the prompts indexColumns functions', () => {
  let prompts: Prompts;
  let collection: CollectionDataset;
  let column2: ColumnDataset;
  let column3: ColumnDataset;
  let index: IndexDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;

    collection = new CollectionDataset(
      {
        name: 'collectionName',
        idType: 'objectId',
        columns: [
          { name: 'column1', type: 'object', subColumns: [{ name: 'column2', type: 'string' }] },
          { name: 'column3', type: 'string' },
        ],
        indexes: [{ name: 'index1', columns: { column3: 1 }, properties: { unique: true } }],
      },
      jest.fn() as any,
    );
    collection.setReference();

    column2 = collection.getColumn('column1.column2', true)!;
    column3 = collection.getColumn('column3')!;

    index = collection.getIndex('index1')!;
  });

  test('it should be return the answers when call() is called', async () => {
    expect.assertions(6);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        {
          choices: [
            { name: 1, short: 1, value: [column2, 1] },
            { name: -1, short: -1, value: [column2, -1] },
            { name: 'text', short: 'text', value: [column2, 'text'] },
            { name: 'hashed', short: 'hashed', value: [column2, 'hashed'] },
          ],
          default: -1,
          message: 'Choose a index type for "column1.column2":',
          name: 'column1.column2',
          type: 'list',
        },
        {
          choices: [
            { name: 1, short: 1, value: [column3, 1] },
            { name: -1, short: -1, value: [column3, -1] },
            { name: 'text', short: 'text', value: [column3, 'text'] },
            { name: 'hashed', short: 'hashed', value: [column3, 'hashed'] },
          ],
          default: -1,
          message: 'Choose a index type for "column3":',
          name: 'column3',
          type: 'list',
        },
      ]);

      return { column1: { column2: [column2, 1] }, column3: [column3, -1] };
    });

    expect(column2).toBeInstanceOf(ColumnDataset);
    expect(column3).toBeInstanceOf(ColumnDataset);
    expect(index).toBeInstanceOf(IndexDataset);

    const result = await call(prompts, { name: 'newIndex', columns: [column2, column3] }, collection);

    expect(result).toEqual({
      'column1.column2': [column2, 1],
      column3: [column3, -1],
    });
    expect(prompts.call).toHaveBeenCalledTimes(1);
  });

  test('it should be return throw an error when call() is called and the combination of columns already exists', async () => {
    expect.assertions(7);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        {
          choices: [
            { name: 1, short: 1, value: [column3, 1] },
            { name: -1, short: -1, value: [column3, -1] },
            { name: 'text', short: 'text', value: [column3, 'text'] },
            { name: 'hashed', short: 'hashed', value: [column3, 'hashed'] },
          ],
          default: -1,
          message: 'Choose a index type for "column3":',
          name: 'column3',
          type: 'list',
        },
      ]);

      return { column3: [column3, 1] };
    });

    expect(column2).toBeInstanceOf(ColumnDataset);
    expect(column3).toBeInstanceOf(ColumnDataset);
    expect(index).toBeInstanceOf(IndexDataset);

    try {
      await call(prompts, { name: 'newIndex', columns: [column3] }, collection);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('An index with the column configuration already exists! (duplicate index: "index1")');
      expect(prompts.call).toHaveBeenCalledTimes(1);
    }
  });

  test('it should be return the questions array then getQuestions() is called without index', () => {
    const result = getQuestions({ name: 'newIndex', columns: [column2, column3] });

    expect(result).toEqual([
      {
        choices: [
          { name: 1, short: 1, value: [column2, 1] },
          { name: -1, short: -1, value: [column2, -1] },
          { name: 'text', short: 'text', value: [column2, 'text'] },
          { name: 'hashed', short: 'hashed', value: [column2, 'hashed'] },
        ],
        default: -1,
        message: 'Choose a index type for "column1.column2":',
        name: 'column1.column2',
        type: 'list',
      },
      {
        choices: [
          { name: 1, short: 1, value: [column3, 1] },
          { name: -1, short: -1, value: [column3, -1] },
          { name: 'text', short: 'text', value: [column3, 'text'] },
          { name: 'hashed', short: 'hashed', value: [column3, 'hashed'] },
        ],
        default: -1,
        message: 'Choose a index type for "column3":',
        name: 'column3',
        type: 'list',
      },
    ]);
  });

  test('it should be return the questions array then getQuestions() is called with index', () => {
    expect(index).toBeInstanceOf(IndexDataset);

    const result = getQuestions({ name: 'newIndex', columns: [column2, column3] }, index);

    expect(result).toEqual([
      {
        choices: [
          { name: 1, short: 1, value: [column2, 1] },
          { name: -1, short: -1, value: [column2, -1] },
          { name: 'text', short: 'text', value: [column2, 'text'] },
          { name: 'hashed', short: 'hashed', value: [column2, 'hashed'] },
        ],
        default: -1,
        message: 'Choose a index type for "column1.column2":',
        name: 'column1.column2',
        type: 'list',
      },
      {
        choices: [
          { name: 1, short: 1, value: [column3, 1] },
          { name: -1, short: -1, value: [column3, -1] },
          { name: 'text', short: 'text', value: [column3, 'text'] },
          { name: 'hashed', short: 'hashed', value: [column3, 'hashed'] },
        ],
        default: 0,
        message: 'Choose a index type for "column3":',
        name: 'column3',
        type: 'list',
      },
    ]);
  });

  test('it should be return the index when evaluation() is called', () => {
    const closure = evaluation({ 'column1.column2': [column2, 1], column3: [column3, -1] });

    expect(closure).toEqual(expect.any(Function));
    expect(index).toBeInstanceOf(IndexDataset);

    const result = closure(index);

    expect(result).toBeInstanceOf(IndexDataset);
    expect(collection.getObject()).toEqual({
      columns: [
        { name: 'column1', subColumns: [{ name: 'column2', type: 'string' }], type: 'object' },
        { name: 'column3', type: 'string' },
      ],
      indexes: [
        {
          columns: { 'column1.column2': 1, column3: -1 },
          name: 'index1',
          properties: { unique: true },
        },
      ],
      name: 'collectionName',
      idType: 'objectId',
    });
  });

  test('it should be return flat object when normalizer() is called', () => {
    const result = normalizer({ column1: { column2: [column2, 1] }, column3: [column3, -1] } as any);

    expect(result).toEqual({
      'column1.column2': [column2, 1],
      column3: [column3, -1],
    });
  });

  test('it should be return true when equalIndexColumns() is called and the combination of columns is same', () => {
    const result = equalIndexColumns({ column3: [column3, 1] }, index.getColumns());

    expect(result).toBe(true);
  });

  test('it should be return true when equalIndexColumns() is called and the combination of columns is not same (various count)', () => {
    const result = equalIndexColumns({ 'column1.column2': [column2, 1], column3: [column3, -1] }, index.getColumns());

    expect(result).toBe(false);
  });

  test('it should be return true when equalIndexColumns() is called and the combination of columns is not same (various types)', () => {
    const result = equalIndexColumns({ column3: [column3, 'hashed'] }, index.getColumns());

    expect(result).toBe(false);
  });
});
