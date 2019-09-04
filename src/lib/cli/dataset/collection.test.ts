jest.mock('./column');
jest.mock('./group');
jest.mock('./index');

import ColumnDataset from './column';
import GroupDataset from './group';
import IndexDataset from './index';

import CollectionDataset from './collection';

import { dataCollectionType } from '../../types';

/**
 *
 */
describe('Check the CollectionDataset class', () => {
  let parent: any;
  let dataset: any;
  let column1: any;
  let column2: any;
  let index1: any;
  let index2: any;

  /**
   *
   */
  beforeEach(() => {
    parent = new (GroupDataset as any)();

    const collection: dataCollectionType = {
      name: 'collection-name',
      columns: [{ name: 'column1', type: 'string' }, { name: 'column2', type: 'number' }],
      indexes: [
        { name: 'index1', columns: { column2: 1 }, properties: {} },
        { name: 'index2', columns: { column1: 1, column2: -1 }, properties: {} },
      ],
    };

    dataset = new CollectionDataset(collection, parent);

    column1 = (ColumnDataset as jest.Mock).mock.instances[0];
    column2 = (ColumnDataset as jest.Mock).mock.instances[1];
    index1 = (IndexDataset as jest.Mock).mock.instances[0];
    index2 = (IndexDataset as jest.Mock).mock.instances[1];
  });

  /**
   *
   */
  test('initialize the class', async () => {
    expect(dataset).toBeInstanceOf(CollectionDataset);

    expect(dataset.parent).toBe(parent);
    expect(dataset.name).toBe('collection-name');
    expect(dataset.columns).toEqual([column1, column2]);
    expect(dataset.indexes).toEqual([index1, index2]);

    expect(ColumnDataset).toHaveBeenCalledTimes(2);
    expect(ColumnDataset).toHaveBeenNthCalledWith(1, { name: 'column1', type: 'string' }, dataset, dataset);
    expect(ColumnDataset).toHaveBeenNthCalledWith(2, { name: 'column2', type: 'number' }, dataset, dataset);

    expect(IndexDataset).toHaveBeenCalledTimes(2);
    expect(IndexDataset).toHaveBeenNthCalledWith(
      1,
      { name: 'index1', columns: { column2: 1 }, properties: {} },
      dataset,
    );
    expect(IndexDataset).toHaveBeenNthCalledWith(
      2,
      { name: 'index2', columns: { column1: 1, column2: -1 }, properties: {} },
      dataset,
    );
  });

  /**
   *
   */
  test('it should be return the name when getName() is called', () => {
    const name = dataset.getName();

    expect(name).toBe('collection-name');
  });

  /**
   *
   */
  test('it should be change the name and the collection will be re-sorted when setName() is called', () => {
    dataset.setName('new-collection-name');

    expect(dataset.name).toBe('new-collection-name');

    expect(parent.sortCollections).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be return indexes when getIndexes() is called', () => {
    const indexes = dataset.getIndexes();

    expect(indexes).toEqual([index1, index2]);
  });

  /**
   *
   */
  test('it should be return expected index when getIndex() is called with an existing name', () => {
    index1.getName.mockReturnValue('index1');

    const index = dataset.getIndex('index1');

    expect(index).toEqual(index1);
  });

  /**
   *
   */
  test('it should be return undefined when getIndex() is called with an non-existing name', () => {
    index1.getName.mockReturnValue('index1');

    const index = dataset.getIndex('index8');

    expect(index).toEqual(undefined);
  });

  /**
   *
   */
  test('it should be add a new index to the index list when addIndex() is called with a index', () => {
    const index4 = new (IndexDataset as any)();

    dataset.sortIndexes = jest.fn();

    const column = dataset.addIndex(index4);

    expect(column).toBe(index4);

    expect(dataset.indexes).toEqual([index1, index2, index4]);

    expect(dataset.sortIndexes).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be remove the index from the index list when removeIndex() is called', () => {
    dataset.removeIndex(index1);

    expect(dataset.indexes).toEqual([index2]);
  });

  /**
   *
   */
  test('it should be remove this collection from the parent list when remove() is called', () => {
    dataset.remove();

    expect(parent.removeCollection).toHaveBeenCalledTimes(1);
    expect(parent.removeCollection).toHaveBeenCalledWith(dataset);
  });

  /**
   *
   */
  test('it should be sorts the columns when sortColumns() is called', () => {
    dataset.sort = jest.fn().mockReturnValue(-1);

    dataset.sortColumns();

    expect(dataset.sort).toHaveBeenCalledTimes(1);
    expect(dataset.sort).toHaveBeenCalledWith(column2, column1);

    expect(dataset.columns).toEqual([column2, column1]);
  });

  /**
   *
   */
  test('it should be sorts the indexes when sortIndexes() is called', () => {
    dataset.sort = jest.fn().mockReturnValue(-1);

    dataset.sortIndexes();

    expect(dataset.sort).toHaveBeenCalledTimes(1);
    expect(dataset.sort).toHaveBeenCalledWith(index2, index1);

    expect(dataset.indexes).toEqual([index2, index1]);
  });

  /**
   *
   */
  test('it should be return -1 when sort() is called with "column1" and "column2"', () => {
    column1.getName.mockReturnValue('column1');
    column2.getName.mockReturnValue('column2');

    const result = dataset.sort(column1, column2);

    expect(result).toBe(-1);

    expect(column1.getName).toHaveBeenCalledTimes(1);
    expect(column2.getName).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be return 1 when sort() is called with "column2" and "column1"', () => {
    column1.getName.mockReturnValue('column1');
    column2.getName.mockReturnValue('column2');

    const result = dataset.sort(column2, column1);

    expect(result).toBe(1);

    expect(column1.getName).toHaveBeenCalledTimes(1);
    expect(column2.getName).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be return 0 when sort() is called with same column', () => {
    column1.getName.mockReturnValue('column1');
    column2.getName.mockReturnValue('column2');

    const result = dataset.sort(column1, column1);

    expect(result).toBe(0);

    expect(column1.getName).toHaveBeenCalledTimes(2);
  });

  /**
   *
   */
  test('it should be return a object when getObject() is called', () => {
    column1.getObject.mockReturnValue({ name: 'column1', type: 'string' });
    column2.getObject.mockReturnValue({ name: 'column2', type: 'number' });

    index1.getObject.mockReturnValue({ name: 'index1', columns: { column2: 1 }, properties: {} });
    index2.getObject.mockReturnValue({ name: 'index2', columns: { column1: 1, column2: -1 }, properties: {} });

    const result = dataset.getObject();

    expect(result).toEqual({
      name: 'collection-name',
      columns: [{ name: 'column1', type: 'string' }, { name: 'column2', type: 'number' }],
      indexes: [
        { name: 'index1', columns: { column2: 1 }, properties: {} },
        { name: 'index2', columns: { column1: 1, column2: -1 }, properties: {} },
      ],
    });
  });
});
