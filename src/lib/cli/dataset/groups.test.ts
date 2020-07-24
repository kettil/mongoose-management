import GroupDataset from './group';

import GroupsDataset from './groups';

describe('Check the GroupsDataset class', () => {
  let dataset: any;
  let groups: any;
  let g1: any;
  let g3: any;

  beforeEach(() => {
    groups = {
      groups: [
        { path: 'path/to/one', collections: [] },
        { path: 'path/to/three', collections: [] },
      ],
    };

    dataset = new GroupsDataset(groups, 'path/to/project');
    dataset.setReference();

    g1 = dataset.getGroup('path/to/one');
    g3 = dataset.getGroup('path/to/three');
  });

  test('initialize the class', () => {
    expect(dataset).toBeInstanceOf(GroupsDataset);

    expect(dataset.parent).toBe(undefined);
    expect(dataset.pathProject).toBe('path/to/project');
    expect(dataset.groups).toEqual([g1, g3]);

    expect(g1).toBeInstanceOf(GroupDataset);
    expect(g3).toBeInstanceOf(GroupDataset);
  });

  test('it should be call setReference() from the groups when setReference() is called', () => {
    const mock1 = jest.fn();
    const mock2 = jest.fn();

    g1.setReference = mock1;
    g3.setReference = mock2;

    dataset.setReference();

    expect(mock1).toHaveBeenCalledTimes(1);
    expect(mock2).toHaveBeenCalledTimes(1);
  });

  test('it should be return the groups when getGroups() is called', () => {
    const result = dataset.getGroups();

    expect(result).toEqual([g1, g3]);
  });

  test('it should be return the group when getGroup() is called with known names', () => {
    const result = dataset.getGroup('path/to/three');

    expect(result).toBe(g3);
  });

  test('it should be return undefined when getGroup() is called with unknown names', () => {
    const result = dataset.getGroup('path/to/nine');

    expect(result).toBe(undefined);
  });

  test('it should be added a group and the list will be re-sorted when addGroup() is called', () => {
    const g2 = new GroupDataset(
      { path: 'path/to/a', collections: [], idType: 'uuidv4', multipleConnection: true },
      dataset,
    );

    dataset.addGroup(g2);

    expect(dataset.groups).toEqual([g2, g1, g3]);
  });

  test('it should be remove the group when removeGroup() is called', () => {
    dataset.removeGroup(g3);

    expect(dataset.groups).toEqual([g1]);
  });

  test('it should be groups will be re-sorted when sortGroups() is called', () => {
    g3.path = 'a';
    dataset.sortGroups();

    expect(dataset.groups).toEqual([g3, g1]);
  });

  test('it should be throw an error when getName() is called', () => {
    expect.assertions(2);
    try {
      dataset.getName();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Groups has no name');
    }
  });

  test('it should be throw an error when remove() is called', () => {
    expect.assertions(2);
    try {
      dataset.remove();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Groups can not be removed');
    }
  });

  test('it should be return the project path when getPathProject() is called', () => {
    const result = dataset.getPathProject();

    expect(result).toBe('path/to/project');
  });

  test('it should be return a data object when getObject() is called', () => {
    const data = dataset.getObject();

    expect(data).toEqual({
      groups: [
        { path: 'path/to/one', collections: [], idType: 'objectId', multipleConnection: false },
        { path: 'path/to/three', collections: [], idType: 'objectId', multipleConnection: false },
      ],
    });
  });
});
