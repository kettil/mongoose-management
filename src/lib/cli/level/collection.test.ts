jest.mock('../../prompts');
jest.mock('./column');
jest.mock('./index');

import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import GroupDataset from '../dataset/group';
import IndexDataset from '../dataset/index';
import { BackToCollectionError } from '../errors';
import CollectionMenu from '../menu/collection';
import promptsCollection from '../prompts/collection';
import ColumnLevel from './column';
import IndexLevel from './index';

import CollectionLevel from './collection';

import { dataColumnType } from '../../types';

describe('Check the CollectionLevel class', () => {
  let prompts: any;
  let storage: any;
  let creater: any;
  let group: GroupDataset;
  let dataset: CollectionDataset;
  let level: any;

  beforeEach(() => {
    prompts = new Prompts();
    storage = jest.fn();
    creater = jest.fn();

    group = new GroupDataset({ path: 'path/to/project', collections: [] }, jest.fn() as any);
    dataset = new CollectionDataset(
      {
        name: 'collectionName',
        columns: [
          { name: 'c1', type: 'string' },
          { name: 'c2', type: 'object' },
        ],
        indexes: [{ name: 'i1', columns: { c1: 'hashed' }, properties: {} }],
      },
      group,
    );
    group.addCollection(dataset);

    level = new CollectionLevel(dataset, { prompts, storage, creater });
  });

  test('initialize the class', () => {
    expect(level).toBeInstanceOf(CollectionLevel);

    expect(level.dataset).toBeInstanceOf(CollectionDataset);
    expect(level.menu).toBeInstanceOf(CollectionMenu);
    expect(level.prompts).toBe(prompts);
    expect(level.options).toEqual({ prompts, storage, creater });

    expect(level.promptCreate).toEqual(expect.any(Function));
    expect(level.promptEdit).toBe(promptsCollection);
  });

  test('it should be promptsIndex() called when create() is called with action "createIndex"', async () => {
    const c1 = dataset.getColumn('c1');

    ((prompts.call as any) as jest.Mock).mockResolvedValueOnce({ name: 'indexName', columns: [c1] });
    ((prompts.call as any) as jest.Mock).mockResolvedValueOnce({ c1: [c1, 1] });
    ((prompts.call as any) as jest.Mock).mockResolvedValueOnce({ unique: true, sparse: false });

    expect(dataset.getIndexes().length).toBe(1);

    const result = await level.create('createIndex');

    expect(result).toBe(undefined);

    expect(dataset.getIndexes().length).toBe(2);
    expect(prompts.call).toHaveBeenCalledTimes(3);
    expect(prompts.call).toHaveBeenCalledWith(expect.any(Array));
  });

  test('it should be promptsIndex() called when create() is called with action "createColumn" and type "string"', async () => {
    ((prompts.call as any) as jest.Mock).mockResolvedValueOnce({ name: 'columnName', type: 'string' });
    ((prompts.call as any) as jest.Mock).mockResolvedValueOnce({ options: ['default'], default: "'Moin'" });
    ((prompts.call as any) as jest.Mock).mockResolvedValueOnce({ type: 'unique', value: 'hashed' });

    expect(dataset.getColumns().length).toBe(5);

    const result = await level.create('createColumn');

    expect(result).toEqual(undefined);

    expect(dataset.getColumns().length).toBe(6);
    expect(prompts.call).toHaveBeenCalledTimes(3);
    expect(prompts.call).toHaveBeenCalledWith(expect.any(Array));
  });

  test.each([['array'], ['object']])(
    'it should be promptsIndex() called when create() is called with action "createColumn" and type "%s"',
    async (type) => {
      ((prompts.call as any) as jest.Mock).mockResolvedValueOnce({ name: 'columnName', type });

      expect(dataset.getColumns().length).toBe(5);

      const result = await level.create('createColumn');

      expect(result).toEqual(expect.any(ColumnDataset));

      expect(dataset.getColumns().length).toBe(6);
      expect(prompts.call).toHaveBeenCalledTimes(1);
      expect(prompts.call).toHaveBeenCalledWith(expect.any(Array));
    },
  );

  test('it should be throw an error when create() is called with unknwon action', async () => {
    expect.assertions(2);
    try {
      await level.create('create');
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Unknown action');
    }
  });

  test('it should be remove the collection when remove() is called', async () => {
    (prompts.remove as jest.Mock).mockImplementation(async (name: any) => {
      expect(typeof name).toBe('string');

      return true;
    });

    expect(group.getCollections().length).toBe(1);

    const result = await level.remove(dataset);

    expect(result).toBe(false);

    expect(group.getCollections().length).toBe(0);
    expect(prompts.remove).toHaveBeenCalledTimes(1);
  });

  test('it should be throw an error when remove() is called with a column reference', async () => {
    const columns: dataColumnType[] = [{ name: 'column2', type: 'objectId', populate: 'collectionName' }];
    group.addCollection(new CollectionDataset({ name: 'collection2', columns, indexes: [] }, group));

    expect.assertions(5);
    expect(group.getCollections().length).toBe(2);

    try {
      await level.remove(dataset);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatchSnapshot();

      expect(group.getCollections().length).toBe(2);
      expect(prompts.remove).toHaveBeenCalledTimes(0);
    }
  });

  test('it should be create IndexLevel when show() is called with an IndexDataset', async () => {
    const subDataset = dataset.getIndex('i1');

    expect(subDataset).toBeInstanceOf(IndexDataset);

    await level.show(subDataset);

    expect(IndexLevel).toHaveBeenCalledTimes(1);
    expect(IndexLevel).toHaveBeenCalledWith(subDataset, { prompts, storage, creater });
    expect(IndexLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(IndexLevel.prototype.exec).toHaveBeenCalledWith();
  });

  test('it should be create ColumnLevel when show() is called with a ColumnDataset', async () => {
    const subDataset = dataset.getColumn('c1');

    expect(subDataset).toBeInstanceOf(ColumnDataset);

    await level.show(subDataset);

    expect(ColumnLevel).toHaveBeenCalledTimes(1);
    expect(ColumnLevel).toHaveBeenCalledWith(subDataset, { prompts, storage, creater });
    expect(ColumnLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(ColumnLevel.prototype.exec).toHaveBeenCalledWith();
  });

  test('it should be catch the error BackToCollectionError when show() is called and this one throws the error BackToCollectionError', async () => {
    (ColumnLevel.prototype.exec as jest.Mock).mockRejectedValue(new BackToCollectionError('back to collection'));

    const subDataset = dataset.getColumn('c1');

    expect(subDataset).toBeInstanceOf(ColumnDataset);

    await level.show(subDataset);

    expect(ColumnLevel).toHaveBeenCalledTimes(1);
    expect(ColumnLevel).toHaveBeenCalledWith(subDataset, { prompts, storage, creater });
    expect(ColumnLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(ColumnLevel.prototype.exec).toHaveBeenCalledWith();
  });

  test('it should be forwards the error when show() is called and this one throws an error', async () => {
    expect.assertions(7);

    (ColumnLevel.prototype.exec as jest.Mock).mockRejectedValue(new Error('other error'));

    const subDataset = dataset.getColumn('c1');

    expect(subDataset).toBeInstanceOf(ColumnDataset);

    try {
      await level.show(subDataset);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('other error');
    }

    expect(ColumnLevel).toHaveBeenCalledTimes(1);
    expect(ColumnLevel).toHaveBeenCalledWith(subDataset, { prompts, storage, creater });
    expect(ColumnLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(ColumnLevel.prototype.exec).toHaveBeenCalledWith();
  });

  test('it should be throw an error when show() is called without Dataset', async () => {
    expect.assertions(6);
    try {
      await level.show({});
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Unknown dataset instance');
    }

    expect(IndexLevel).toHaveBeenCalledTimes(0);
    expect(IndexLevel.prototype.exec).toHaveBeenCalledTimes(0);
    expect(ColumnLevel).toHaveBeenCalledTimes(0);
    expect(ColumnLevel.prototype.exec).toHaveBeenCalledTimes(0);
  });

  test('it should be throw an error when promptCreate() is called', async () => {
    expect.assertions(2);
    try {
      await level.promptCreate();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Creating action is not done in the abstract class');
    }
  });
});
