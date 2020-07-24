import Prompts from '../../prompts';
import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';

const mockCall = jest.fn();

import execute from './group';

describe('Check the prompts group function', () => {
  let prompts: Prompts;

  let groups: GroupsDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;

    groups = new GroupsDataset(
      { groups: [{ path: 'path/to', collections: [], idType: 'objectId', multipleConnection: false }] },
      '/project/path',
    );
    groups.setReference();
  });

  test('it should be return the group when execute() is called', async () => {
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

    const result = await execute(prompts, groups);

    expect(result).toBeInstanceOf(GroupDataset);
    expect(result.getObject()).toEqual({
      collections: [],
      path: 'src/odm',
      idType: 'objectId',
      multipleConnection: false,
    });
  });
});
