import Collection from './collection';

import ColumnDataset from './column';
import IndexDataset from './index';

describe('Check the IndexDataset class', () => {
  let collection: Collection;
  let dataset: any;
  let index: any;
  let c3: ColumnDataset;
  let c6: ColumnDataset;
  let c9: ColumnDataset;

  beforeEach(() => {
    index = {
      name: 'i1',
      columns: { c3: 1, 'c6.c9': -1 },
      properties: { unique: true },
      readonly: false,
    };

    collection = new Collection(
      {
        name: 'collect1',
        columns: [
          { name: 'c3', type: 'string' },
          { name: 'c6', type: 'object', subColumns: [{ name: 'c9', type: 'number' }] },
        ],
        indexes: [index],
      },
      {} as any,
    );
    collection.setReference();

    dataset = collection.getIndex('i1')!;

    c3 = collection.getColumn('c3')!;
    c6 = collection.getColumn('c6')!;
    c9 = collection.getColumn('c6.c9', true)!;
  });

  test('initialize the class', () => {
    dataset = new IndexDataset({ ...index, readonly: true }, collection);

    expect(dataset).toBeInstanceOf(IndexDataset);

    expect(dataset.parent).toBe(collection);
    expect(dataset.name).toBe('i1');
    expect(dataset.columns).toEqual([]);
    expect(dataset.readonly).toEqual(true);
  });

  test('initialize the class with setReference', () => {
    expect(dataset).toBeInstanceOf(IndexDataset);

    expect(dataset.parent).toBe(collection);
    expect(dataset.name).toBe('i1');
    expect(dataset.columns).toEqual([[expect.any(ColumnDataset), 1], [expect.any(ColumnDataset), -1]]);
    expect(dataset.readonly).toEqual(false);

    expect(c3).toBeInstanceOf(ColumnDataset);
    expect(c6).toBeInstanceOf(ColumnDataset);
    expect(c9).toBeInstanceOf(ColumnDataset);
  });

  test('it should be return the path when getName() is called', () => {
    const result = dataset.getName();

    expect(result).toBe('i1');
  });

  test('it should be updated the path when setName() is called', () => {
    dataset.setName('i7');

    expect(dataset.name).toBe('i7');
  });

  test('it should be return the collections when getColumns() is called', () => {
    const result = dataset.getColumns();

    expect(result).toEqual([[expect.any(ColumnDataset), 1], [expect.any(ColumnDataset), -1]]);
  });

  test('it should be return the collections when getColumnsNormalize() is called', () => {
    const result = dataset.getColumnsNormalize();

    expect(result).toEqual({ c3: 1, 'c6.c9': -1 });
  });

  test('it should be set the column list when setColumns() is called', () => {
    dataset.setColumns([[c3, 'hashed']]);

    expect(dataset.columns).toEqual([[c3, 'hashed']]);
  });

  test('it should be return true when hasColumn() is called with an existing column name', () => {
    const result = dataset.hasColumn('c6.c9');

    expect(result).toBe(true);
  });

  test('it should be return false when hasColumn() is called with a non-existent column name', () => {
    const result = dataset.hasColumn('c8');

    expect(result).toBe(false);
  });

  test('it should be return a property value when getProperty() is called', () => {
    const result = dataset.getProperty('unique');

    expect(result).toEqual(true);
    expect(dataset.properties).toEqual({ unique: true });
  });

  test('it should be set a property value when setProperty() is called', () => {
    dataset.setProperty('sparse', true);

    expect(dataset.properties).toEqual({ sparse: true, unique: true });
  });

  test('it should be return true when isReadonly() is called', () => {
    const result = dataset.isReadonly();

    expect(result).toBe(false);
  });

  test('it should be remove this index when remove() is called', () => {
    expect(collection.getIndexes()).toEqual([dataset]);

    dataset.remove();

    expect(collection.getIndexes()).toEqual([]);
  });

  test('it should be return a data object when getObject() is called [1]', () => {
    const data = dataset.getObject();

    expect(data).toEqual({
      columns: { c3: 1, 'c6.c9': -1 },
      name: 'i1',
      properties: { unique: true },
    });
  });

  test('it should be return a data object when getObject() is called [2]', () => {
    dataset.properties = { sparse: true };
    dataset.readonly = true;

    const data = dataset.getObject();

    expect(data).toEqual({
      columns: { c3: 1, 'c6.c9': -1 },
      name: 'i1',
      properties: { sparse: true },
      readonly: true,
    });
  });
});
