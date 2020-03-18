import ColumnDataset from './column';
import GroupDataset from './group';
import IndexDataset from './index';

import CollectionDataset from './collection';

describe('Check the CollectionDataset class', () => {
  let group: any;
  let dataset: any;
  let column1: any;
  let column7: any;
  let index1: any;
  let index7: any;

  beforeEach(() => {
    group = new GroupDataset(
      {
        path: 'path',
        collections: [
          {
            name: 'collection-name',
            idType: 'objectId',
            columns: [
              { name: 'column1', type: 'string' },
              {
                name: 'column7',
                type: 'object',
                subColumns: [],
              },
            ],
            indexes: [
              { name: 'index1', columns: { column7: 1 }, properties: {} },
              { name: 'index7', columns: { column1: 1, column7: -1 }, properties: {} },
            ],
          },
          {
            name: 'collect2',
            idType: 'uuidv4',
            columns: [
              { name: 'ref1', type: 'objectId', populate: 'collection-name' },
              { name: 'ref2', type: 'objectId', populate: 'collection-name.column7' },
              { name: 'ref3', type: 'objectId', populate: 'collect2' },
            ],
            indexes: [],
          },
        ],
      },
      jest.fn() as any,
    );
    group.setReference();

    dataset = group.getCollection('collection-name');

    column1 = dataset.getColumn('column1')!;
    column7 = dataset.getColumn('column7')!;
    index1 = dataset.getIndex('index1')!;
    index7 = dataset.getIndex('index7')!;
  });

  test('initialize the class', () => {
    expect(dataset).toBeInstanceOf(CollectionDataset);

    expect(dataset.parent).toBe(group);
    expect(dataset.name).toBe('collection-name');
    expect(dataset.columns).toEqual([
      expect.any(ColumnDataset),
      column1,
      column7,
      expect.any(ColumnDataset),
      expect.any(ColumnDataset),
    ]);
    expect(dataset.indexes).toEqual([index1, index7]);

    expect(column1).toBeInstanceOf(ColumnDataset);
    expect(column7).toBeInstanceOf(ColumnDataset);
    expect(index1).toBeInstanceOf(IndexDataset);
    expect(index7).toBeInstanceOf(IndexDataset);
  });

  test('it should be call setReference() from the groups when setReference() is called', () => {
    const mock1 = jest.fn();
    const mock2 = jest.fn();
    const mock3 = jest.fn();
    const mock4 = jest.fn();

    column1.setReference = mock1;
    column7.setReference = mock2;
    index1.setReference = mock3;
    index7.setReference = mock4;

    dataset.setReference();

    expect(mock1).toHaveBeenCalledTimes(1);
    expect(mock2).toHaveBeenCalledTimes(1);
    expect(mock3).toHaveBeenCalledTimes(1);
    expect(mock4).toHaveBeenCalledTimes(1);
  });

  test('it should be return the name when getName() is called', () => {
    const name = dataset.getName();

    expect(name).toBe('collection-name');
  });

  test('it should be change the name and the collection will be re-sorted when setName() is called', () => {
    dataset.setName('new-collection-name');

    expect(dataset.name).toBe('new-collection-name');
  });

  test('it should be return indexes when getIndexes() is called', () => {
    const indexes = dataset.getIndexes();

    expect(indexes).toEqual([index1, index7]);
  });

  test('it should be return expected index when getIndex() is called with an existing name', () => {
    const index = dataset.getIndex('index1');

    expect(index).toEqual(index1);
  });

  test('it should be return undefined when getIndex() is called with an non-existing name', () => {
    const index = dataset.getIndex('index8');

    expect(index).toEqual(undefined);
  });

  test.each([
    ['collection-name', 'objectId'],
    ['collect2', 'uuidv4'],
  ])(
    'getIdType() on collection "%s" should return the currently selected idType "%s"',
    (collectionName, expectedIdType) => {
      const collection = group.getCollection(collectionName);
      if (!collection) {
        throw new Error(`Could not get collection '${collectionName}'`);
      }
      expect(collection.getIdType()).toBe(expectedIdType);
    },
  );

  test.each([
    ['objectId', 'objectId'],
    ['uuidv4', 'uuidv4'],
    ['randomValueThatDoesNotExist', 'objectId'],
  ])('setIdType("%s") should set the idType to "%s"', (input, output) => {
    dataset.setIdType(input);
    expect(dataset.getIdType()).toBe(output);
  });

  test('it should be add a new index to the index list when addIndex() is called with a index', () => {
    const index3 = new IndexDataset({ name: 'index3', columns: { column7: 1 }, properties: {} }, dataset);

    const column = dataset.addIndex(index3);

    expect(column).toBe(index3);

    expect(dataset.indexes).toEqual([index1, index3, index7]);
  });

  test('it should be remove the index from the index list when removeIndex() is called', () => {
    dataset.removeIndex(index1);

    expect(dataset.indexes).toEqual([index7]);
  });

  test('it should be sorts the indexes when sortIndexes() is called', () => {
    index7.name = 'a';

    dataset.sortIndexes();

    expect(dataset.indexes).toEqual([index7, index1]);
  });

  test('it should be remove this collection from the parent list when remove() is called', () => {
    const collection = group.getCollection('collect2');
    expect(collection).toBeInstanceOf(CollectionDataset);
    expect(group.getCollections()).toEqual([dataset, collection]);

    dataset.remove();

    expect(group.getCollections()).toEqual([collection]);
  });

  test('it should be return an array with columns when getPopulates() is called (references from another collection)', () => {
    const collection = group.getCollection('collect2');
    expect(collection).toBeInstanceOf(CollectionDataset);

    const col1 = collection.getColumn('ref1');
    const col2 = collection.getColumn('ref2');
    expect(col1).toBeInstanceOf(ColumnDataset);
    expect(col2).toBeInstanceOf(ColumnDataset);

    const result = dataset.getPopulates();

    expect(result).toEqual([col1, col2]);
  });

  test('it should be return an array with columns when getPopulates() is called (references from the same collection)', () => {
    const collection = group.getCollection('collect2');
    expect(collection).toBeInstanceOf(CollectionDataset);

    const col1 = collection.getColumn('ref3');
    expect(col1).toBeInstanceOf(ColumnDataset);

    const result = collection.getPopulates();

    expect(result).toEqual([col1]);
  });

  test('it should be return an array with columns when getPopulates() is called and without own populates (references from the same collection)', () => {
    const collection = group.getCollection('collect2');
    expect(collection).toBeInstanceOf(CollectionDataset);

    const result = collection.getPopulates(false);

    expect(result).toEqual([]);
  });

  test('it should be return a object when getObject() is called', () => {
    const result = group.getObject();

    expect(result).toMatchSnapshot();
  });
});
