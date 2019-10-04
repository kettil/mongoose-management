jest.mock('./group');

import GroupDataset from './group';

import GroupsDataset from './groups';

/**
 *
 */
describe('Check the GroupsDataset class', () => {
  let dataset: any;
  let groups: any;
  let g1: any;
  let g2: any;

  /**
   *
   */
  beforeEach(() => {
    groups = {
      groups: [{ path: 'path/to/one', collections: [] }, { path: 'path/to/two', collections: [] }],
    };

    dataset = new GroupsDataset(groups, 'path/to/project');

    g1 = (GroupDataset as jest.Mock).mock.instances[0];
    g2 = (GroupDataset as jest.Mock).mock.instances[1];
  });

  /**
   *
   */
  test('initialize the class', () => {
    expect(dataset).toBeInstanceOf(GroupsDataset);

    expect(dataset.parent).toBe(undefined);
    expect(dataset.groups).toEqual([expect.any(GroupDataset), expect.any(GroupDataset)]);

    expect(GroupDataset).toHaveBeenCalledTimes(2);
    expect(GroupDataset).toHaveBeenNthCalledWith(1, { path: 'path/to/one', collections: [] }, dataset);
    expect(GroupDataset).toHaveBeenNthCalledWith(2, { path: 'path/to/two', collections: [] }, dataset);
  });

  /**
   *
   */
  test('it should be return the groups when getGroups() is called', () => {
    const result = dataset.getGroups();

    expect(result).toEqual([g1, g2]);
  });

  /**
   *
   */
  test('it should be return the group when getGroup() is called with known names', () => {
    g1.getPath.mockReturnValue('g1');
    g2.getPath.mockReturnValue('g2');

    const result = dataset.getGroup('g2');

    expect(result).toBe(g2);
  });

  /**
   *
   */
  test('it should be return undefined when getGroup() is called with unknown names', () => {
    g1.getPath.mockReturnValue('g1');
    g2.getPath.mockReturnValue('g2');

    const result = dataset.getGroup('c9');

    expect(result).toBe(undefined);
  });

  /**
   *
   */
  test('it should be added a group and the list will be re-sorted when addGroup() is called', () => {
    dataset.sortGroups = jest.fn();

    const group = new (GroupDataset as any)();

    dataset.addGroup(group);

    expect(dataset.groups).toEqual([g1, g2, group]);

    expect(dataset.sortGroups).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be remove the group when removeGroup() is called', () => {
    dataset.removeGroup(g2);

    expect(dataset.groups).toEqual([g1]);
  });

  /**
   *
   */
  test('it should be groups will be re-sorted when sortGroups() is called', () => {
    g1.getPath.mockReturnValue('p2');
    g2.getPath.mockReturnValue('p1');

    dataset.sortGroups();

    expect(dataset.groups).toEqual([g2, g1]);
  });

  /**
   *
   */
  test('it should be throw an error when getName() is called', () => {
    expect.assertions(2);
    try {
      dataset.getName();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Groups has no name');
    }
  });

  /**
   *
   */
  test('it should be throw an error when remove() is called', () => {
    expect.assertions(2);
    try {
      dataset.remove();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Groups can not be removed');
    }
  });

  /**
   *
   */
  test('it should be return the project path when getPathProject() is called', () => {
    const result = dataset.getPathProject();

    expect(result).toBe('path/to/project');
  });

  /**
   *
   */
  test('it should be return a data object when getObject() is called', () => {
    g1.getObject.mockReturnValue({ path: 'path/to/one', collections: [] });
    g2.getObject.mockReturnValue({ path: 'path/to/two', collections: [] });

    const data = dataset.getObject();

    expect(data).toEqual({
      groups: [{ path: 'path/to/one', collections: [] }, { path: 'path/to/two', collections: [] }],
    });

    expect(g1.getObject).toHaveBeenCalledTimes(1);
    expect(g2.getObject).toHaveBeenCalledTimes(1);
  });
});
