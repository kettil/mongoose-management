import Prompts, { regexpNameMessage } from '../../prompts';
import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';
import { CancelPromptError } from '../errors';

import { call, evaluation, excludePath, getQuestions, pathRelative, validateName } from './groupMain';

const mockCall = jest.fn();

describe('Check the prompts groupMain functions', () => {
  let prompts: Prompts;
  let group: GroupDataset;
  let groups: GroupsDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;

    groups = new GroupsDataset(
      { groups: [{ path: 'path/to', collections: [], multipleConnection: true, idType: 'uuidv4' }] },
      '/project/path',
    );
    groups.setReference();

    group = groups.getGroup('path/to')!;
  });

  test('it should be return the answers when call() is called', async () => {
    expect.assertions(3);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        {
          excludePath: expect.any(Function),
          itemType: 'directory',
          message: 'Target path for the group:',
          name: 'path',
          rootPath: '/project/path',
          suggestOnly: false,
          type: 'fuzzypath',
          when: true,
        },
        {
          default: 'odm',
          message: 'Collection group name:',
          name: 'name',
          type: 'input',
          validate: expect.any(Function),
          when: true,
        },
        {
          choices: [
            { name: 'ObjectId', short: 'ObjectId', value: 'objectId' },
            { name: 'UUIDv4', short: 'UUIDv4', value: 'uuidv4' },
          ],
          default: 'objectId',
          message: "Type of '_id' column:",
          name: 'idType',
          type: 'list',
        },
        {
          default: false,
          message: 'Preparation for multiple connections (connection via "createConnection")',
          name: 'multipleConnection',
          type: 'confirm',
        },
      ]);

      return {
        path: '/project/path/src',
        name: 'odm',
      };
    });

    const result = await call(prompts, groups);

    expect(result).toEqual({ name: 'odm', path: '/project/path/src' });
    expect(prompts.call).toHaveBeenCalledTimes(1);
  });

  test('it should be throw an error when call() is called and name is empty', async () => {
    expect.assertions(4);

    mockCall.mockImplementation((questions) => {
      expect(questions).toEqual([
        {
          excludePath: expect.any(Function),
          itemType: 'directory',
          message: 'Target path for the group:',
          name: 'path',
          rootPath: '/project/path',
          suggestOnly: false,
          type: 'fuzzypath',
          when: true,
        },
        {
          default: 'odm',
          message: 'Collection group name:',
          name: 'name',
          type: 'input',
          validate: expect.any(Function),
          when: true,
        },
        {
          choices: [
            { name: 'ObjectId', short: 'ObjectId', value: 'objectId' },
            { name: 'UUIDv4', short: 'UUIDv4', value: 'uuidv4' },
          ],
          default: 'objectId',
          message: "Type of '_id' column:",
          name: 'idType',
          type: 'list',
        },
        {
          default: false,
          message: 'Preparation for multiple connections (connection via "createConnection")',
          name: 'multipleConnection',
          type: 'confirm',
        },
      ]);

      return {
        path: '/project/path/src',
        name: '',
      };
    });

    try {
      await call(prompts, groups);
    } catch (err) {
      expect(err).toBeInstanceOf(CancelPromptError);
      expect(err.message).toBe('cancel');

      expect(prompts.call).toHaveBeenCalledTimes(1);
    }
  });

  test('it should be return the questions array then getQuestions() is called', () => {
    const result = getQuestions(groups);

    expect(result).toEqual([
      {
        excludePath: expect.any(Function),
        itemType: 'directory',
        message: 'Target path for the group:',
        name: 'path',
        rootPath: '/project/path',
        suggestOnly: false,
        type: 'fuzzypath',
        when: true,
      },
      {
        default: 'odm',
        message: 'Collection group name:',
        name: 'name',
        type: 'input',
        validate: expect.any(Function),
        when: true,
      },
      {
        choices: [
          { name: 'ObjectId', short: 'ObjectId', value: 'objectId' },
          { name: 'UUIDv4', short: 'UUIDv4', value: 'uuidv4' },
        ],
        default: 'objectId',
        message: "Type of '_id' column:",
        name: 'idType',
        type: 'list',
      },
      {
        default: false,
        message: 'Preparation for multiple connections (connection via "createConnection")',
        name: 'multipleConnection',
        type: 'confirm',
      },
    ]);
  });

  test('it should be return the group when evaluation() is called', () => {
    const closure = evaluation(
      {
        path: '/project/path',
        name: 'odm',
        multipleConnection: true,
        idType: 'uuidv4',
      },
      groups,
    );

    expect(closure).toEqual(expect.any(Function));
    expect(groups.getGroups().length).toBe(1);

    const result = closure();

    expect(result).toBeInstanceOf(GroupDataset);
    expect(result.getObject()).toEqual({ collections: [], path: 'odm', multipleConnection: true, idType: 'uuidv4' });
    expect(groups.getGroups().length).toBe(2);
  });

  test('it should be return the group when evaluation() is called with group', () => {
    const closure = evaluation(
      {
        path: '/project/path/src',
        name: 'odm',
        multipleConnection: true,
        idType: 'uuidv4',
      },
      groups,
    );

    expect(closure).toEqual(expect.any(Function));
    expect(groups.getGroups().length).toBe(1);

    const result = closure(group);

    expect(result).toBeInstanceOf(GroupDataset);
    expect(result).toBe(group);
    expect(result.getObject()).toEqual({
      collections: [],
      path: 'path/to',
      multipleConnection: true,
      idType: 'uuidv4',
    });
    expect(groups.getGroups().length).toBe(1);
  });

  test.each<[string, string, string | boolean]>([
    ['true', 'name9  ', true],
    ['string', '_name9', regexpNameMessage],
    ['string', 'name2', 'The path and the name already exist as a group [group: src/name2]!'],
  ])('it should be return %s when validateName() is called (%p)', (_, name, expected) => {
    const closure = validateName(['name1', 'src/name2'], groups.getPathProject());

    expect(closure).toEqual(expect.any(Function));

    const result = closure(name, { path: 'src' });

    expect(result).toEqual(expected);
  });

  test.each([
    ['src/odm', '/project/src', '/project'],
    ['odm', '/project', '/project'],
  ])(
    'it should be return %p when pathRelative() is called with arguments %p and %p',
    (expected, pathDocuments, pathProject) => {
      const result = pathRelative('odm', pathDocuments, pathProject);

      expect(result).toBe(expected);
    },
  );

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
