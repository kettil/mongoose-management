import chalk from 'chalk';

import { schemaTypes } from '../../mongo';
import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import GroupDataset from '../dataset/group';

import { call, evaluation, getQuestions } from './columnPopulate';

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
          columns: [],
          indexes: [],
        },
        group,
      ),
    );

    collection1 = group.addCollection(
      new CollectionDataset(
        {
          name: 'collectionName1',
          columns: [{ name: 'column1', type: 'objectId', populate: 'collectionName2' }],
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
          name: 'populate',
          message: 'Choose a reference collection',
          default: 2,
          choices: [
            { name: '- Without reference -', short: chalk.red('Without reference'), value: undefined },
            { name: 'collectionName1', short: 'collectionName1', value: collection1 },
            { name: 'collectionName2', short: 'collectionName2', value: collection2 },
          ],
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
        name: 'populate',
        message: 'Choose a reference collection',
        choices: [
          { name: '- Without reference -', short: chalk.red('Without reference'), value: undefined },
          { name: 'collectionName1', short: 'collectionName1', value: collection1 },
          { name: 'collectionName2', short: 'collectionName2', value: collection2 },
        ],
      },
    ]);
  });

  test('it should be return the questions array then getQuestions() is called with column', () => {
    expect(column).toBeInstanceOf(ColumnDataset);

    const result = getQuestions(collection1, column);

    expect(result).toEqual([
      {
        type: 'list',
        name: 'populate',
        message: 'Choose a reference collection',
        default: 2,
        choices: [
          { name: '- Without reference -', short: chalk.red('Without reference'), value: undefined },
          { name: 'collectionName1', short: 'collectionName1', value: collection1 },
          { name: 'collectionName2', short: 'collectionName2', value: collection2 },
        ],
      },
    ]);
  });

  test('it should be return the column when evaluation() is called', () => {
    column.setPopulate();

    const closure = evaluation({ populate: collection2 });

    expect(closure).toEqual(expect.any(Function));
    expect(column).toBeInstanceOf(ColumnDataset);

    const result = closure(column);

    expect(result).toBe(column);
    expect(collection1.getObject()).toEqual({
      columns: [
        { name: 'column1', populate: 'collectionName2', subColumns: undefined, subTypes: undefined, type: 'objectId' },
      ],
      indexes: [],
      name: 'collectionName1',
    });
  });
});
