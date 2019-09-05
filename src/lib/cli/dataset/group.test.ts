jest.mock('./collection');
jest.mock('./groups');

import CollectionDataset from './collection';
import GroupsDataset from './groups';

import GroupDataset from './group';

/**
 *
 */
describe('Check the GroupDataset class', () => {
  let dataset: any;
  let parent: any;
  let group: any;
  let c1: any;
  let c2: any;

  /**
   *
   */
  beforeEach(() => {
    parent = new (GroupsDataset as any)();

    group = {
      path: 'path/to',
      collections: [{ name: 'c1', columns: [], indexes: [] }, { name: 'c2', columns: [], indexes: [] }],
    };

    dataset = new GroupDataset(group, parent);

    c1 = (CollectionDataset as jest.Mock).mock.instances[0];
    c2 = (CollectionDataset as jest.Mock).mock.instances[1];
  });

  /**
   *
   */
  test('initialize the class', () => {
    expect(dataset).toBeInstanceOf(GroupDataset);

    expect(dataset.parent).toBe(parent);
    expect(dataset.path).toBe('path/to');
    expect(dataset.collections).toEqual([expect.any(CollectionDataset), expect.any(CollectionDataset)]);

    expect(CollectionDataset).toHaveBeenCalledTimes(2);
    expect(CollectionDataset).toHaveBeenNthCalledWith(1, { name: 'c1', columns: [], indexes: [] }, dataset);
    expect(CollectionDataset).toHaveBeenNthCalledWith(2, { name: 'c2', columns: [], indexes: [] }, dataset);
  });

  /**
   *
   */
  test('it should be return the path when getPath() is called', () => {
    const result = dataset.getPath();

    expect(result).toBe('path/to');
  });

  /**
   *
   */
  test('it should be updated the path when setPath() is called', () => {
    dataset.setPath('other/path');

    expect(dataset.path).toBe('other/path');
  });

  /**
   *
   */
  test('it should be return the collections when getCollections() is called', () => {
    const result = dataset.getCollections();

    expect(result).toEqual([c1, c2]);
  });

  /**
   *
   */
  test('it should be return the collection when getCollection() is called with known names', () => {
    c1.getName.mockReturnValue('c1');
    c2.getName.mockReturnValue('c2');

    const result = dataset.getCollection('c2');

    expect(result).toBe(c2);
  });

  /**
   *
   */
  test('it should be return undefined when getCollection() is called with unknown names', () => {
    c1.getName.mockReturnValue('c1');
    c2.getName.mockReturnValue('c2');

    const result = dataset.getCollection('c9');

    expect(result).toBe(undefined);
  });

  /**
   *
   */
  test('it should be added a collection and the list will be re-sorted when addCollection() is called', () => {
    dataset.sortCollections = jest.fn();

    const collection = new (CollectionDataset as any)();

    dataset.addCollection(collection);

    expect(dataset.collections).toEqual([c1, c2, collection]);

    expect(dataset.sortCollections).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be remove the collection when removeCollection() is called', () => {
    dataset.removeCollection(c2);

    expect(dataset.collections).toEqual([c1]);
  });

  /**
   *
   */
  test('it should be collections will be re-sorted when sortCollections() is called', () => {
    dataset.sort = jest.fn();
    dataset.sort.mockReturnValue(-1);

    dataset.sortCollections();

    expect(dataset.collections).toEqual([c2, c1]);
  });

  /**
   *
   */
  test('it should be return -1 when sort() is called with c1 and c2', () => {
    c1.getName.mockReturnValue('c1');
    c2.getName.mockReturnValue('c2');

    const result = dataset.sort(c1, c2);

    expect(result).toEqual(-1);
  });

  /**
   *
   */
  test('it should be return 1 when sort() is called with c2 and c1', () => {
    c1.getName.mockReturnValue('c2');
    c2.getName.mockReturnValue('c1');

    const result = dataset.sort(c1, c2);

    expect(result).toEqual(1);
  });

  /**
   *
   */
  test('it should be return 0 when sort() is called with c2 and c2', () => {
    c1.getName.mockReturnValue('c2');
    c2.getName.mockReturnValue('c2');

    const result = dataset.sort(c1, c2);

    expect(result).toEqual(0);
  });

  /**
   *
   */
  test('it should be return the path when getName() is called', () => {
    const result = dataset.getName();

    expect(result).toBe('path/to');
  });

  /**
   *
   */
  test('it should be remove this group when remove() is called', () => {
    dataset.remove();

    expect(parent.removeCollection).toHaveBeenCalledTimes(1);
    expect(parent.removeCollection).toHaveBeenCalledWith(dataset);
  });

  /**
   *
   */
  test('it should be return a data object when getObject() is called', () => {
    c1.getObject.mockReturnValue({ name: 'c1', columns: [], indexes: [] });
    c2.getObject.mockReturnValue({ name: 'c2', columns: [], indexes: [] });

    const data = dataset.getObject();

    expect(data).toEqual({
      path: 'path/to',
      collections: [{ name: 'c1', columns: [], indexes: [] }, { name: 'c2', columns: [], indexes: [] }],
    });

    expect(c1.getObject).toHaveBeenCalledTimes(1);
    expect(c2.getObject).toHaveBeenCalledTimes(1);
  });
});
