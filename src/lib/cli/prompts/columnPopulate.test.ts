import chalk from 'chalk';

import { schemaTypes } from '../../mongo';
import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import GroupDataset from '../dataset/group';

import {
  call,
  choicesColumn,
  defaultColumn,
  evaluation,
  getCollectionWithNestedSchemas,
  getQuestions,
  whenColumn,
} from './columnPopulate';

const mockCall = jest.fn();

describe('Check the prompts columnPopulate functions', () => {
  let prompts: Prompts;
  let group: GroupDataset;
  let collection1: CollectionDataset;
  let collection2: CollectionDataset;
  let column: ColumnDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;

    group = new GroupDataset({ path: 'path/to', collections: [] }, jest.fn() as any);
    group.setReference();

    collection2 = group.addCollection(
      new CollectionDataset(
        {
          name: 'collectionName2',
          idType: 'objectId',
          columns: [{ name: 'column3', type: 'object' }],
          indexes: [],
        },
        group,
      ),
    );

    collection1 = group.addCollection(
      new CollectionDataset(
        {
          name: 'collectionName1',
          idType: 'objectId',
          columns: [
            { name: 'column1', type: 'objectId', populate: 'collectionName2' },
            { name: 'column2', type: 'objectId', populate: 'collectionName2.column3' },
          ],
          indexes: [],
        },
        group,
      ),
    );

    column = collection1.getColumn('column1')!;
  });

  test('it should be return the answers when call() is called', async () => {
    expect.assertions(4);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        {
          type: 'list',
          name: 'collection',
          message: 'Choose a reference collection',
          default: 2,
          choices: [
            { name: '- Without reference -', short: chalk.red('Without reference') },
            { name: 'collectionName1', short: 'collectionName1', value: collection1 },
            { name: 'collectionName2', short: 'collectionName2', value: collection2 },
          ],
        },
        {
          choices: expect.any(Function),
          default: expect.any(Function),
          message: 'Choose a column with nested schemas or the collection',
          name: 'column',
          type: 'list',
          when: expect.any(Function),
        },
      ]);

      return { populate: collection2 };
    });

    expect(column).toBeInstanceOf(ColumnDataset);

    const result = await call(
      prompts,
      collection1,
      { name: 'columnName', type: 'arrayType' },
      ['arrayType', 'objectId'],
      column,
    );

    expect(result).toEqual({ populate: collection2 });
    expect(prompts.call).toHaveBeenCalledTimes(1);
  });

  test.each<[any, any[]]>(
    Object.keys(schemaTypes)
      .filter((k) => k !== 'objectId')
      .map((k) => [k, ['string']]),
  )('it should be return the answers when call() is called with type %p', async (type, answersSubType) => {
    expect(column).toBeInstanceOf(ColumnDataset);

    const result = await call(prompts, collection1, { name: 'columnName', type }, answersSubType, column);

    expect(result).toEqual({});
    expect(prompts.call).toHaveBeenCalledTimes(0);
  });

  test('it should be return the questions array then getQuestions() is called without column', () => {
    const result = getQuestions(collection1);

    expect(result).toEqual([
      {
        type: 'list',
        name: 'collection',
        message: 'Choose a reference collection',
        choices: [
          { name: '- Without reference -', short: chalk.red('Without reference'), value: undefined },
          { name: 'collectionName1', short: 'collectionName1', value: collection1 },
          { name: 'collectionName2', short: 'collectionName2', value: collection2 },
        ],
      },
      {
        choices: expect.any(Function),
        default: expect.any(Function),
        message: 'Choose a column with nested schemas or the collection',
        name: 'column',
        type: 'list',
        when: expect.any(Function),
      },
    ]);
  });

  test('it should be return the questions array then getQuestions() is called with column', () => {
    expect(column).toBeInstanceOf(ColumnDataset);

    const result = getQuestions(collection1, column);

    expect(result).toEqual([
      {
        type: 'list',
        name: 'collection',
        message: 'Choose a reference collection',
        default: 2,
        choices: [
          { name: '- Without reference -', short: chalk.red('Without reference') },
          { name: 'collectionName1', short: 'collectionName1', value: collection1 },
          { name: 'collectionName2', short: 'collectionName2', value: collection2 },
        ],
      },
      {
        choices: expect.any(Function),
        default: expect.any(Function),
        message: 'Choose a column with nested schemas or the collection',
        name: 'column',
        type: 'list',
        when: expect.any(Function),
      },
    ]);
  });

  test('it should be return the questions array then getQuestions() is called with column', () => {
    column = collection1.getColumn('column2')!;

    expect(column).toBeInstanceOf(ColumnDataset);

    const result = getQuestions(collection1, column);

    expect(result).toEqual([
      {
        type: 'list',
        name: 'collection',
        message: 'Choose a reference collection',
        default: 2,
        choices: [
          { name: '- Without reference -', short: chalk.red('Without reference') },
          { name: 'collectionName1', short: 'collectionName1', value: collection1 },
          { name: 'collectionName2', short: 'collectionName2', value: collection2 },
        ],
      },
      {
        choices: expect.any(Function),
        default: expect.any(Function),
        message: 'Choose a column with nested schemas or the collection',
        name: 'column',
        type: 'list',
        when: expect.any(Function),
      },
    ]);
  });

  test('it should be return the column when evaluation() is called and populate is a collection', () => {
    column.setPopulate();

    const closure = evaluation({ collection: collection2 });

    expect(closure).toEqual(expect.any(Function));
    expect(column).toBeInstanceOf(ColumnDataset);

    const result = closure(column);

    expect(result).toBe(column);
    expect(collection1.getObject()).toEqual({
      columns: [
        { name: 'column1', populate: 'collectionName2', type: 'objectId' },
        {
          name: 'column2',
          populate: 'collectionName2.column3',
          type: 'objectId',
        },
      ],
      indexes: [],
      idType: 'objectId',
      name: 'collectionName1',
    });
  });

  test('it should be return the column when evaluation() is called and populate is a column', () => {
    column = collection2.getColumn('column3')!;

    expect(column).toBeInstanceOf(ColumnDataset);

    column.setPopulate();

    const closure = evaluation({ collection: collection2, column });

    expect(closure).toEqual(expect.any(Function));
    expect(column).toBeInstanceOf(ColumnDataset);

    const result = closure(column);

    expect(result).toBe(column);
    expect(collection1.getObject()).toEqual({
      columns: [
        { name: 'column1', populate: 'collectionName2', type: 'objectId' },
        {
          name: 'column2',
          populate: 'collectionName2.column3',
          type: 'objectId',
        },
      ],
      indexes: [],
      idType: 'objectId',
      name: 'collectionName1',
    });
  });

  test('it should be return column list when getCollectionWithNestedSchemas() is called', () => {
    column = collection2.getColumn('column3')!;

    expect(column).toBeInstanceOf(ColumnDataset);

    const result = getCollectionWithNestedSchemas(collection2);

    expect(result).toEqual([column]);
  });

  test('it should be return true when whenColumn() is called', () => {
    const result = whenColumn({ collection: collection2 });

    expect(result).toBe(true);
  });

  test('it should be return true when whenColumn() is called without column types "object" and "array"', () => {
    const result = whenColumn({ collection: collection1 });

    expect(result).toBe(false);
  });

  test('it should be return false when whenColumn() is called without collection', () => {
    const result = whenColumn({});

    expect(result).toBe(false);
  });

  test('it should be return choice list when choicesColumn() is called without nested schemas', () => {
    const result = choicesColumn({ collection: collection1 });

    expect(result).toEqual([{ name: '_id', short: 'collectionName1._id' }]);
  });

  test('it should be return choice list when choicesColumn() is called with nested schemas', () => {
    column = collection2.getColumn('column3')!;

    expect(column).toBeInstanceOf(ColumnDataset);

    const result = choicesColumn({ collection: collection2 });

    expect(result).toEqual([
      { name: '_id', short: 'collectionName2._id' },
      { name: 'column3', short: 'column3', value: column },
    ]);
  });

  test('it should be throw an error when choicesColumn() is called without collection', () => {
    expect.assertions(2);
    try {
      choicesColumn({});
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('No collection has been selected');
    }
  });

  test('it should be return 1 when defaultColumn() is called with a column', () => {
    column = collection2.getColumn('column3')!;

    expect(column).toBeInstanceOf(ColumnDataset);

    const closure = defaultColumn(column);

    expect(closure).toBeInstanceOf(Function);

    const result = closure({ collection: collection2 });

    expect(result).toBe(1);
  });

  test('it should be return -1 when defaultColumn() is called with a collection', () => {
    const closure = defaultColumn(collection2);

    expect(closure).toBeInstanceOf(Function);

    const result = closure({ collection: collection2 });

    expect(result).toBe(-1);
  });

  test('it should be return -1 when defaultColumn() is called with nothing', () => {
    const closure = defaultColumn(collection2);

    expect(closure).toBeInstanceOf(Function);

    const result = closure({});

    expect(result).toBe(-1);
  });
});
