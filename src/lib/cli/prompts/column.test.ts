import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';

import execute from './column';

const mockCall = jest.fn();

describe('Check the prompts column function', () => {
  let prompts: Prompts;
  let collection: CollectionDataset;
  let column: ColumnDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;

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

  test('it should be return the column when execute() is called with collection', async () => {
    expect.assertions(8);

    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toMatchSnapshot('main');

      return { name: 'newColumnName', type: 'string' };
    });

    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toMatchSnapshot('options');

      return { options: ['default', 'trim'], default: 'Hello' };
    });

    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toMatchSnapshot('index');

      return { type: 'index', value: 1 };
    });

    expect(collection.getColumns().length).toBe(4);

    const result = await execute(prompts, collection);

    expect(collection.getColumns().length).toBe(5);
    expect(result).toBeInstanceOf(ColumnDataset);
    expect(result.getObject()).toEqual({
      default: 'Hello',
      enum: undefined,
      lowercase: undefined,
      match: undefined,
      max: undefined,
      maxLength: undefined,
      min: undefined,
      minLength: undefined,
      name: 'newColumnName',
      required: undefined,
      subColumns: undefined,
      subTypes: undefined,
      trim: true,
      type: 'string',
      uppercase: undefined,
    });
    expect(prompts.call).toHaveBeenCalledTimes(3);
  });

  test('it should be return the column when execute() is called with collection and column', async () => {
    expect.assertions(10);

    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toMatchSnapshot('main');

      return { name: 'newColumnName', type: 'string' };
    });

    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toMatchSnapshot('options');

      return { options: ['default', 'trim'], default: 'Hello' };
    });

    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toMatchSnapshot('index');

      return { type: 'index', value: 1 };
    });

    expect(column).toBeInstanceOf(ColumnDataset);
    expect(collection.getColumns().length).toBe(4);

    const result = await execute(prompts, collection, column);

    expect(collection.getColumns().length).toBe(4);
    expect(result).toBeInstanceOf(ColumnDataset);
    expect(result).toBe(column);
    expect(result.getObject()).toEqual({
      default: 'Hello',
      enum: undefined,
      lowercase: undefined,
      match: undefined,
      max: undefined,
      maxLength: undefined,
      min: undefined,
      minLength: undefined,
      name: 'newColumnName',
      required: undefined,
      subColumns: undefined,
      subTypes: undefined,
      trim: true,
      type: 'string',
      uppercase: undefined,
    });
    expect(prompts.call).toHaveBeenCalledTimes(3);
  });

  test('it should be return the column when execute() is called with column', async () => {
    expect.assertions(9);

    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toMatchSnapshot('main');

      return { name: 'newColumnName', type: 'string' };
    });

    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toMatchSnapshot('options');

      return { options: ['default', 'trim'], default: 'Hello' };
    });

    mockCall.mockImplementationOnce((questions) => {
      expect(questions).toMatchSnapshot('index');

      return { type: 'index', value: 1 };
    });

    expect(column).toBeInstanceOf(ColumnDataset);
    expect(collection.getColumns().length).toBe(4);

    column.set('type', 'object');

    const result = await execute(prompts, column);

    expect(collection.getColumns().length).toBe(4);
    expect(result).toBeInstanceOf(ColumnDataset);
    expect(result.getObject()).toEqual({
      default: 'Hello',
      enum: undefined,
      lowercase: undefined,
      match: undefined,
      max: undefined,
      maxLength: undefined,
      min: undefined,
      minLength: undefined,
      name: 'newColumnName',
      required: undefined,
      subColumns: undefined,
      subTypes: undefined,
      trim: true,
      type: 'string',
      uppercase: undefined,
    });
    expect(prompts.call).toHaveBeenCalledTimes(3);
  });
});
