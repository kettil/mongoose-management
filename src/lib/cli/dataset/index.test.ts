jest.mock('./collection');

import CollectionDataset from './collection';

import IndexDataset from './index';

/**
 *
 */
describe('Check the IndexDataset class', () => {
  let dataset: any;
  let parent: any;
  let index: any;

  /**
   *
   */
  beforeEach(() => {
    parent = new (CollectionDataset as any)();

    index = {
      name: 'i1',
      columns: { c3: 1, c6: -1 },
      properties: { unique: true },
      readonly: true,
    };

    dataset = new IndexDataset(index, parent);
  });

  /**
   *
   */
  test('initialize the class', () => {
    expect(dataset).toBeInstanceOf(IndexDataset);

    expect(dataset.parent).toBe(parent);
    expect(dataset.name).toBe('i1');
    expect(dataset.columns).toEqual({ c3: 1, c6: -1 });
    expect(dataset.readonly).toEqual(true);
  });

  /**
   *
   */
  test('it should be return the path when getName() is called', () => {
    const result = dataset.getName();

    expect(result).toBe('i1');
  });

  /**
   *
   */
  test('it should be updated the path when setName() is called', () => {
    dataset.setName('i7');

    expect(dataset.name).toBe('i7');
  });

  /**
   *
   */
  test('it should be return the collections when getColumns() is called', () => {
    const result = dataset.getColumns();

    expect(result).toEqual({ c3: 1, c6: -1 });
  });

  /**
   *
   */
  test('it should be set the column list when setColumns() is called', () => {
    dataset.setColumns({ c4: 1, c7: -1 });

    expect(dataset.columns).toEqual({ c4: 1, c7: -1 });
  });

  /**
   *
   */
  test('it should be updated all columns with the new name when updateColumnName() is called (c3 => c8)', () => {
    dataset.updateColumnName('c3', 'c8');

    expect(dataset.columns).toEqual({ c8: 1, c6: -1 });
  });

  /**
   *
   */
  test('it should be updated all columns with the new name when updateColumnName() is called (c1.s3 => c1.s9)', () => {
    dataset.columns = { 'c1.s3.d': 1, 'c1.s5.b': -1 };

    dataset.updateColumnName('c1.s3', 'c1.s9');

    expect(dataset.columns).toEqual({ 'c1.s9.d': 1, 'c1.s5.b': -1 });
  });

  /**
   *
   */
  test('it should be updated all columns with the new name when updateColumnName() is called (c1 => c3)', () => {
    dataset.columns = { 'c1.s3.d': 1, 'c1.s5.b': -1 };

    dataset.updateColumnName('c1', 'c3');

    expect(dataset.columns).toEqual({ 'c3.s3.d': 1, 'c3.s5.b': -1 });
  });

  /**
   *
   */
  test('it should be return a property value when getProperty() is called', () => {
    const result = dataset.getProperty('unique');

    expect(result).toEqual(true);
    expect(dataset.properties).toEqual({ unique: true });
  });

  /**
   *
   */
  test('it should be set a property value when setProperty() is called', () => {
    dataset.setProperty('sparse', true);

    expect(dataset.properties).toEqual({ sparse: true, unique: true });
  });

  /**
   *
   */
  test.each<[string, object]>([
    ['index', {}],
    ['unique', { unique: true }],
    ['sparse', { sparse: true }],
    ['unique', { unique: true, sparse: true }],
    ['unique', { unique: true, sparse: false }],
    ['sparse', { unique: false, sparse: true }],
    ['index', { unique: false, sparse: false }],
  ])('it should be return %s when getColumnType() is called %p', (expected, properties) => {
    dataset.properties = properties;

    const result = dataset.getColumnType();

    expect(result).toBe(expected);
  });

  /**
   *
   */
  test('it should be return undefined when getColumnValue() is called with two column items', () => {
    const result = dataset.getColumnValue();

    expect(result).toBe(undefined);
  });

  /**
   *
   */
  test('it should be return the column value when getColumnValue() is called with one column item', () => {
    dataset.columns = { c: 'hashed' };

    const result = dataset.getColumnValue();

    expect(result).toBe('hashed');
  });

  /**
   *
   */
  test('it should be return undefined when getColumnValue() is called with null column items', () => {
    dataset.columns = {};

    const result = dataset.getColumnValue();

    expect(result).toBe(undefined);
  });

  /**
   *
   */
  test('it should be return true when isReadonly() is called', () => {
    const result = dataset.isReadonly();

    expect(result).toBe(true);
  });

  /**
   *
   */
  test('it should be remove this index when remove() is called', () => {
    dataset.remove();

    expect(parent.removeIndex).toHaveBeenCalledTimes(1);
    expect(parent.removeIndex).toHaveBeenCalledWith(dataset);
  });

  /**
   *
   */
  test('it should be return a data object when getObject() is called [1]', () => {
    const data = dataset.getObject();

    expect(data).toEqual({
      columns: { c3: 1, c6: -1 },
      name: 'i1',
      properties: { unique: true },
      readonly: true,
    });
  });

  /**
   *
   */
  test('it should be return a data object when getObject() is called [2]', () => {
    dataset.properties = { sparse: true };
    dataset.readonly = false;

    const data = dataset.getObject();

    expect(data).toEqual({
      columns: { c3: 1, c6: -1 },
      name: 'i1',
      properties: { sparse: true },
    });
  });
});
