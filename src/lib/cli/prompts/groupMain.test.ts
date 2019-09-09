jest.mock('../../prompts');
jest.mock('../dataset/group');
jest.mock('../dataset/groups');

import Prompts, { regexpName, regexpNameMessage } from '../../prompts';
import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';

import { call, evaluation, excludePath, getQuestions, validateName } from './groupMain';

/**
 *
 */
describe('Check the prompts groupMain functions', () => {
  /**
   *
   */
  test('it should be return the answers when call() is called', async () => {
    const prompts = new (Prompts as any)();
    const groups = new (GroupsDataset as any)();
    const group1 = new (GroupDataset as any)();
    const group2 = new (GroupDataset as any)();

    (group1.getPath as jest.Mock).mockReturnValue('oldName1');
    (group2.getPath as jest.Mock).mockReturnValue('oldName2');
    (groups.getGroups as jest.Mock).mockReturnValue([group1, group2]);
    (groups.getPathProject as jest.Mock).mockReturnValue('path/to/project');

    (prompts.call as jest.Mock).mockResolvedValue({ name: 'groupName', path: 'path/to' });

    const result = await call(prompts, groups);

    expect(result).toEqual({ name: 'groupName', path: 'path/to' });

    expect(prompts.call).toHaveBeenCalledTimes(1);
    expect(prompts.call).toHaveBeenCalledWith([
      {
        excludePath: expect.any(Function),
        itemType: 'directory',
        message: 'Target path for the group:',
        name: 'path',
        rootPath: 'path/to/project',
        suggestOnly: false,
        type: 'fuzzypath',
      },
      {
        default: 'odm',
        message: 'Collection group name:',
        name: 'name',
        type: 'input',
        validate: expect.any(Function),
      },
    ]);

    expect(group1.getPath).toHaveBeenCalledTimes(1);
    expect(group2.getPath).toHaveBeenCalledTimes(1);
    expect(groups.getGroups).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be throw an error when call() is called and name is empty', async () => {
    const prompts = new (Prompts as any)();
    const groups = new (GroupsDataset as any)();
    const group1 = new (GroupDataset as any)();
    const group2 = new (GroupDataset as any)();

    (group1.getPath as jest.Mock).mockReturnValue('oldName1');
    (group2.getPath as jest.Mock).mockReturnValue('oldName2');
    (groups.getGroups as jest.Mock).mockReturnValue([group1, group2]);
    (groups.getPathProject as jest.Mock).mockReturnValue('path/to/project');

    (prompts.call as jest.Mock).mockResolvedValue({ name: '', path: 'path/to' });

    expect.assertions(7);
    try {
      await call(prompts, groups);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('cancel');

      expect(prompts.call).toHaveBeenCalledTimes(1);
      expect(prompts.call).toHaveBeenCalledWith([
        {
          excludePath: expect.any(Function),
          itemType: 'directory',
          message: 'Target path for the group:',
          name: 'path',
          rootPath: 'path/to/project',
          suggestOnly: false,
          type: 'fuzzypath',
        },
        {
          default: 'odm',
          message: 'Collection group name:',
          name: 'name',
          type: 'input',
          validate: expect.any(Function),
        },
      ]);

      expect(groups.getGroups).toHaveBeenCalledTimes(1);
      expect(group1.getPath).toHaveBeenCalledTimes(1);
      expect(group2.getPath).toHaveBeenCalledTimes(1);
    }
  });

  /**
   *
   */
  test('it should be return the questions array then getQuestions() is called', () => {
    const groups = new (GroupsDataset as any)();
    const group1 = new (GroupDataset as any)();
    const group2 = new (GroupDataset as any)();

    (group1.getPath as jest.Mock).mockReturnValue('oldName1');
    (group2.getPath as jest.Mock).mockReturnValue('oldName2');
    (groups.getGroups as jest.Mock).mockReturnValue([group1, group2]);
    (groups.getPathProject as jest.Mock).mockReturnValue('path/to/project');

    const result = getQuestions(groups);

    expect(result).toEqual([
      {
        excludePath: expect.any(Function),
        itemType: 'directory',
        message: 'Target path for the group:',
        name: 'path',
        rootPath: 'path/to/project',
        suggestOnly: false,
        type: 'fuzzypath',
      },
      {
        default: 'odm',
        message: 'Collection group name:',
        name: 'name',
        type: 'input',
        validate: expect.any(Function),
      },
    ]);

    expect(groups.getGroups).toHaveBeenCalledTimes(1);
    expect(groups.getPathProject).toHaveBeenCalledTimes(2);
    expect(group1.getPath).toHaveBeenCalledTimes(1);
    expect(group2.getPath).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be return the group when evaluation() is called', () => {
    const groups = new (GroupsDataset as any)();

    (groups.getPathProject as jest.Mock).mockReturnValue('projectPath');
    (groups.addGroup as jest.Mock).mockImplementation((a) => a);

    const closure = evaluation({ name: 'gName', path: 'projectPath/gPath' }, groups);

    expect(closure).toEqual(expect.any(Function));

    const result = closure();

    expect(result).toBeInstanceOf(GroupDataset);

    expect(GroupDataset).toHaveBeenCalledTimes(1);
    expect(GroupDataset).toHaveBeenCalledWith({ collections: [], path: 'gPath/gName' }, groups);

    expect(groups.getPathProject).toHaveBeenCalledTimes(1);

    expect(groups.addGroup).toHaveBeenCalledTimes(1);
    expect(groups.addGroup).toHaveBeenCalledWith(result);
  });

  /**
   *
   */
  test('it should be return the group when evaluation() is called with group', () => {
    const groups = new (GroupsDataset as any)();
    const group = new (GroupDataset as any)();

    (groups.getPathProject as jest.Mock).mockReturnValue('projectPath');

    const closure = evaluation({ name: 'gName', path: 'projectPath/gPath' }, groups);

    expect(closure).toEqual(expect.any(Function));

    const result = closure(group);

    expect(result).toBeInstanceOf(GroupDataset);

    expect(GroupDataset).toHaveBeenCalledTimes(1);
    expect(GroupDataset).toHaveBeenCalledWith();

    expect(groups.getPathProject).toHaveBeenCalledTimes(1);
    expect(groups.addGroup).toHaveBeenCalledTimes(0);

    expect(group.setPath).toHaveBeenCalledTimes(1);
    expect(group.setPath).toHaveBeenCalledWith('gPath/gName');
  });

  /**
   *
   */
  test.each<[string, string, string | boolean, boolean, string]>([
    ['true', 'name9  ', true, true, 'name9'],
    ['string', 'name9  ', regexpNameMessage, false, 'name9'],
    ['string', 'name2', 'The path and the name already exist as a group [group: gPath/name2]!', true, 'name2'],
  ])('it should be return %s when validateName() is called (%p)', (_, name, expected, regexpReturn, regexpValue) => {
    const mock = jest.fn().mockReturnValue(regexpReturn);

    regexpName.test = mock;

    const closure = validateName(['gpath/name1', 'gpath/name2'], 'projectPath');

    expect(closure).toEqual(expect.any(Function));

    const result = closure(name, { path: 'projectPath/gPath' });

    expect(result).toEqual(expected);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(regexpValue);
  });

  /**
   *
   */
  test.each<[boolean, string]>([
    [false, '.'],
    [false, 'path/to'],
    [true, '../'],
    [true, 'node_modules'],
    [true, 'src/node_modules'],
  ])('it should be return %p when excludePath() is called with "%s"', (expected, path) => {
    const result = excludePath(path);

    expect(result).toBe(expected);
  });
});
