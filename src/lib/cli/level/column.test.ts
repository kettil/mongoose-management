jest.mock('../../prompts');

import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import GroupDataset from '../dataset/group';
import ColumnMenu from '../menu/column';
import promptsColumn from '../prompts/column';

import ColumnLevel from './column';

describe('Check the ColumnLevel class', () => {
  let prompts: any;
  let storage: any;
  let creater: any;
  let dataset: ColumnDataset;
  let level: any;

  beforeEach(() => {
    prompts = new Prompts();
    storage = jest.fn();
    creater = jest.fn();

    const group = new GroupDataset({ path: 'path/to/project', collections: [] }, jest.fn() as any);
    const parent = new CollectionDataset(
      {
        name: 'c1',
        columns: [
          { name: 'cName', type: 'string' },
          { name: 'columnName', type: 'array', subColumns: [{ name: 'subColumnName', type: 'string' }] },
        ],
        indexes: [{ name: 'name_unique', columns: { cName: -1 }, properties: {} }],
      },
      group,
    );

    group.addCollection(parent);

    dataset = parent.getColumn('columnName')!;
    level = new ColumnLevel(dataset, { prompts, storage, creater });
  });

  test('initialize the class', () => {
    expect(level).toBeInstanceOf(ColumnLevel);

    expect(level.dataset).toBeInstanceOf(ColumnDataset);
    expect(level.menu).toBeInstanceOf(ColumnMenu);
    expect(level.prompts).toBe(prompts);
    expect(level.options).toEqual({ prompts, storage, creater });

    expect(level.promptCreate).toBe(promptsColumn);
    expect(level.promptEdit).toBe(promptsColumn);
  });

  test('it should be promptsColumn() called when create() is called with type "string"', async () => {
    ((prompts.call as any) as jest.Mock).mockResolvedValueOnce({ name: 'columnName', type: 'string' });
    ((prompts.call as any) as jest.Mock).mockResolvedValueOnce({ options: ['default'], default: "'Moin'" });
    ((prompts.call as any) as jest.Mock).mockResolvedValueOnce({ type: 'unique', value: 'hashed' });

    expect(dataset.getColumns().length).toBe(2);

    const result = await level.create();

    expect(result).toEqual(undefined);

    expect(dataset.getColumns().length).toBe(3);
    expect(prompts.call).toHaveBeenCalledTimes(3);
    expect(prompts.call).toHaveBeenCalledWith(expect.any(Array));
  });

  test.each([['array'], ['object']])(
    'it should be promptsColumn() called when create() is called with type "%s"',
    async (type) => {
      ((prompts.call as any) as jest.Mock).mockResolvedValueOnce({ name: 'columnName', type });

      expect(dataset.getColumns().length).toBe(2);

      const result = await level.create();

      expect(result).toEqual(expect.any(ColumnDataset));

      expect(dataset.getColumns().length).toBe(3);
      expect(prompts.call).toHaveBeenCalledTimes(1);
      expect(prompts.call).toHaveBeenCalledWith(expect.any(Array));
    },
  );

  test('it should be remove dataset when remove() is called with confirmation', async () => {
    (prompts.remove as jest.Mock).mockResolvedValue(true);

    const subColumn = dataset.getColumn('subColumnName');

    expect(subColumn).toBeInstanceOf(ColumnDataset);
    expect(dataset.getColumns().length).toBe(2);

    const result = await level.remove(subColumn);

    expect(result).toBe(false);
    expect(dataset.getColumns().length).toBe(1);
  });

  test('it should be not remove dataset when remove() is called without confirmation', async () => {
    (prompts.remove as jest.Mock).mockResolvedValue(false);

    const subColumn = dataset.getColumn('subColumnName');

    expect(subColumn).toBeInstanceOf(ColumnDataset);
    expect(dataset.getColumns().length).toBe(2);

    const result = await level.remove(subColumn);

    expect(result).toBe(true);
    expect(dataset.getColumns().length).toBe(2);
  });

  test('it should be throw an error when remove() is called with subcolumns', async () => {
    expect.assertions(2);
    try {
      await level.remove(dataset);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('There are still subcolumns. These must be deleted first!');
    }
  });

  test('it should be throw an error when remove() is called with own index', async () => {
    expect.assertions(4);

    const subColumn = dataset.getColumn('subColumnName')!;

    expect(subColumn).toBeInstanceOf(ColumnDataset);
    expect(dataset.getColumns().length).toBe(2);

    subColumn.setIndex('text', 'unique');

    const result = await level.remove(subColumn);

    expect(result).toBe(true);
    expect(dataset.getColumns().length).toBe(2);
  });

  test('it should be throw an error when remove() is called with a reference', async () => {
    expect.assertions(6);

    const column = dataset.getCollection().getColumn('cName')!;
    const subColumn = dataset.getColumn('subColumnName')!;

    expect(column).toBeInstanceOf(ColumnDataset);
    expect(subColumn).toBeInstanceOf(ColumnDataset);
    expect(column.getCollection().getColumns().length).toBe(5);

    column.setPopulate(dataset);
    dataset.getColumns().forEach((c) => c.remove());

    try {
      await level.remove(dataset);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatchSnapshot();

      expect(column.getCollection().getColumns().length).toBe(5);
    }
  });

  test('it should be throw an error when remove() is called with others indexes', async () => {
    expect.assertions(5);

    const column = dataset.getCollection().getColumn('cName');
    const subColumn = dataset.getColumn('subColumnName')!;

    expect(column).toBeInstanceOf(ColumnDataset);
    expect(subColumn).toBeInstanceOf(ColumnDataset);
    expect(dataset.getColumns().length).toBe(2);

    subColumn.setIndex('text', 'unique');

    const result = await level.remove(subColumn);

    expect(result).toBe(true);
    expect(dataset.getColumns().length).toBe(2);
  });

  test('it should be throw an error when remove() is called with indexes found', async () => {
    expect.assertions(3);

    const column = dataset.getCollection().getColumn('cName')!;

    expect(column).toBeInstanceOf(ColumnDataset);

    try {
      await level.remove(column);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatchSnapshot();
    }
  });

  test('it should be create ColumnLevel when show() is called', async () => {
    ColumnLevel.prototype.exec = jest.fn();

    const subDataset = jest.fn();

    await level.show(subDataset);

    expect(ColumnLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(ColumnLevel.prototype.exec).toHaveBeenCalledWith();
  });
});
