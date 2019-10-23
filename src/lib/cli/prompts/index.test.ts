import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import IndexDataset from '../dataset/index';

import execute from './index';

const mockCall = jest.fn();

describe('Check the prompts index function', () => {
  let prompts: Prompts;
  let collection: CollectionDataset;
  let column2: ColumnDataset;
  let column3: ColumnDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;

    collection = new CollectionDataset(
      {
        name: 'collectionName',
        columns: [
          { name: 'column1', type: 'object', subColumns: [{ name: 'column2', type: 'string' }] },
          { name: 'column3', type: 'string' },
        ],
        indexes: [{ name: 'index1', columns: { column1: 1 }, properties: {} }],
      },
      jest.fn() as any,
    );
    collection.setReference();

    column2 = collection.getColumn('column1.column2', true)!;
    column3 = collection.getColumn('column3')!;
  });

  test('it should be return the index when execute() is called', async () => {
    expect.assertions(8);

    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toMatchSnapshot();

      return { name: 'newIndexName', columns: [column2, column3] };
    });

    mockCall.mockImplementationOnce((questions) => {
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

    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toEqual([
        { default: undefined, message: 'Unique index?', name: 'unique', type: 'confirm' },
        { default: undefined, message: 'Sparse index?', name: 'sparse', type: 'confirm' },
      ]);

      return { unique: true, sparse: false };
    });

    expect(column2).toBeInstanceOf(ColumnDataset);
    expect(column3).toBeInstanceOf(ColumnDataset);

    const result = await execute(prompts, collection);

    expect(result).toBeInstanceOf(IndexDataset);
    expect(result.getObject()).toEqual({
      columns: { 'column1.column2': 1, column3: -1 },
      name: 'newIndexName',
      properties: { sparse: undefined, unique: true },
      readonly: undefined,
    });
    expect(mockCall).toHaveBeenCalledTimes(3);
  });
});
