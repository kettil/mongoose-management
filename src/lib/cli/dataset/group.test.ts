import CollectionDataset from './collection';
import GroupsDataset from './groups';

import GroupDataset from './group';

describe('Check the GroupDataset class', () => {
  let dataset: any;
  let groups: any;
  let c1: any;
  let c6: any;

  beforeEach(() => {
    groups = new GroupsDataset(
      {
        groups: [
          {
            path: 'path/to',
            collections: [
              { name: 'c1', columns: [], indexes: [], idType: 'objectId' },
              { name: 'c6', columns: [], indexes: [], idType: 'objectId' },
            ],
          },
        ],
      },
      jest.fn() as any,
    );

    dataset = groups.getGroup('path/to');
    dataset.setReference();

    c1 = dataset.getCollection('c1');
    c6 = dataset.getCollection('c6');
  });

  test('initialize the class', () => {
    expect(dataset).toBeInstanceOf(GroupDataset);

    expect(dataset.parent).toBe(groups);
    expect(dataset.path).toBe('path/to');
    expect(dataset.collections).toEqual([c1, c6]);

    expect(c1).toBeInstanceOf(CollectionDataset);
    expect(c6).toBeInstanceOf(CollectionDataset);
  });

  test('it should be call setReference() from the collections when setReference() is called', () => {
    const mock1 = jest.fn();
    const mock2 = jest.fn();

    c1.setReference = mock1;
    c6.setReference = mock2;

    dataset.setReference();

    expect(mock1).toHaveBeenCalledTimes(1);
    expect(mock2).toHaveBeenCalledTimes(1);
  });

  test('it should be return the path when getPath() is called', () => {
    const result = dataset.getPath();

    expect(result).toBe('path/to');
  });

  test('it should be updated the path when setPath() is called', () => {
    dataset.setPath('other/path');

    expect(dataset.path).toBe('other/path');
  });

  test('it should be return the collections when getCollections() is called', () => {
    const result = dataset.getCollections();

    expect(result).toEqual([c1, c6]);
  });

  test('it should be return the collection when getCollection() is called with known names', () => {
    const result = dataset.getCollection('c6');

    expect(result).toBe(c6);
  });

  test('it should be return undefined when getCollection() is called with unknown names', () => {
    const result = dataset.getCollection('c9');

    expect(result).toBe(undefined);
  });

  test('it should be added a collection and the list will be re-sorted when addCollection() is called', () => {
    const collection = new CollectionDataset({ name: 'c3', columns: [], indexes: [], idType: 'objectId' }, dataset);

    dataset.addCollection(collection);

    expect(dataset.collections).toEqual([c1, collection, c6]);
  });

  test('it should be remove the collection when removeCollection() is called', () => {
    dataset.removeCollection(c6);

    expect(dataset.collections).toEqual([c1]);
  });

  test('it should be collections will be re-sorted when sortCollections() is called', () => {
    c6.name = 'a';

    dataset.sortCollections();

    expect(dataset.collections).toEqual([c6, c1]);
  });

  test('it should be return the path when getName() is called', () => {
    const result = dataset.getName();

    expect(result).toBe('path/to');
  });

  test('it should be remove this group when remove() is called', () => {
    expect(groups.getGroups()).toEqual([dataset]);

    dataset.remove();

    expect(groups.getGroups()).toEqual([]);
  });

  test('it should be return a data object when getObject() is called', () => {
    const data = dataset.getObject();

    expect(data).toEqual({
      path: 'path/to',
      collections: [
        { name: 'c1', columns: [], indexes: [], idType: 'objectId' },
        { name: 'c6', columns: [], indexes: [], idType: 'objectId' },
      ],
    });
  });
});
