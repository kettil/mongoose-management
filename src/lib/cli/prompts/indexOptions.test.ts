import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import IndexDataset from '../dataset/index';

import { call, evaluation, getQuestions } from './indexOptions';

const mockCall = jest.fn();

describe('Check the prompts indexOptions functions', () => {
  let prompts: Prompts;
  let collection: CollectionDataset;
  let column1: ColumnDataset;
  let column2: ColumnDataset;
  let index: IndexDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;

    collection = new CollectionDataset(
      {
        name: 'collectionName',
        idType: 'objectId',
        columns: [
          { name: 'column1', type: 'string' },
          { name: 'column2', type: 'string' },
        ],
        indexes: [{ name: 'index1', columns: { column1: 1 }, properties: { unique: true } }],
      },
      jest.fn() as any,
    );
    collection.setReference();

    column1 = collection.getColumn('column1')!;
    column2 = collection.getColumn('column2')!;

    index = collection.getIndex('index1')!;
  });

  test('it should be return the answers when call() is called', async () => {
    expect.assertions(4);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        { default: true, message: 'Unique index?', name: 'unique', type: 'confirm' },
        { default: false, message: 'Sparse index?', name: 'sparse', type: 'confirm' },
      ]);

      return { unique: true, sparse: false };
    });

    expect(index).toBeInstanceOf(IndexDataset);

    const result = await call(prompts, index);

    expect(result).toEqual({ unique: true, sparse: false });
    expect(prompts.call).toHaveBeenCalledTimes(1);
  });

  test('it should be return the questions array then getQuestions() is called without index', () => {
    const result = getQuestions();

    expect(result).toEqual([
      { default: undefined, message: 'Unique index?', name: 'unique', type: 'confirm' },
      { default: undefined, message: 'Sparse index?', name: 'sparse', type: 'confirm' },
    ]);
  });

  test('it should be return the questions array then getQuestions() is called with index', () => {
    expect(index).toBeInstanceOf(IndexDataset);

    const result = getQuestions(index);

    expect(result).toEqual([
      { default: true, message: 'Unique index?', name: 'unique', type: 'confirm' },
      { default: false, message: 'Sparse index?', name: 'sparse', type: 'confirm' },
    ]);
  });

  test('it should be return the index when evaluation() is called (unique)', () => {
    expect(column1).toBeInstanceOf(ColumnDataset);
    expect(column2).toBeInstanceOf(ColumnDataset);

    const closure = evaluation({ unique: true, sparse: false });

    expect(closure).toEqual(expect.any(Function));
    expect(index).toBeInstanceOf(IndexDataset);

    const result = closure(index);

    expect(result).toBeInstanceOf(IndexDataset);
    expect(collection.getObject()).toEqual({
      columns: [
        { name: 'column1', type: 'string' },
        { name: 'column2', type: 'string' },
      ],
      indexes: [{ columns: { column1: 1 }, name: 'index1', properties: { unique: true } }],
      name: 'collectionName',
      idType: 'objectId',
    });
  });

  test('it should be return the index when evaluation() is called (sparse)', () => {
    expect(column1).toBeInstanceOf(ColumnDataset);
    expect(column2).toBeInstanceOf(ColumnDataset);

    const closure = evaluation({ unique: false, sparse: true });

    expect(closure).toEqual(expect.any(Function));
    expect(index).toBeInstanceOf(IndexDataset);

    const result = closure(index);

    expect(result).toBeInstanceOf(IndexDataset);
    expect(collection.getObject()).toEqual({
      columns: [
        { name: 'column1', type: 'string' },
        { name: 'column2', type: 'string' },
      ],
      indexes: [{ columns: { column1: 1 }, name: 'index1', properties: { sparse: true } }],
      name: 'collectionName',
      idType: 'objectId',
    });
  });
});
