jest.mock('./group');

import GroupsDataset from '../dataset/groups';
import GroupsMenu from '../menu/groups';
import promptsGroup from '../prompts/group';
import GroupLevel from './group';

import GroupsLevel from './groups';

describe('Check the GroupsLevel class', () => {
  let prompts: any;
  let storage: any;
  let creater: any;
  let dataset: GroupsDataset;
  let level: any;

  beforeEach(() => {
    prompts = jest.fn();
    storage = jest.fn();
    creater = jest.fn();

    dataset = new GroupsDataset({ groups: [] }, 'path');
    level = new GroupsLevel(dataset, { prompts, storage, creater });
  });

  test('initialize the class', () => {
    expect(level).toBeInstanceOf(GroupsLevel);

    expect(level.dataset).toBeInstanceOf(GroupsDataset);
    expect(level.menu).toBeInstanceOf(GroupsMenu);
    expect(level.prompts).toBe(prompts);
    expect(level.options).toEqual({ prompts, storage, creater });

    expect(level.promptCreate).toBe(promptsGroup);
    expect(level.promptEdit).toEqual(expect.any(Function));
  });

  test('it should be create GroupLevel when show() is called', async () => {
    const subDataset = jest.fn();

    await level.show(subDataset);

    expect(GroupLevel).toHaveBeenCalledTimes(1);
    expect(GroupLevel).toHaveBeenCalledWith(subDataset, { prompts, storage, creater });

    expect(GroupLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(GroupLevel.prototype.exec).toHaveBeenCalledWith();
  });

  test('it should be throw an error when promptEdit() is called', async () => {
    expect.assertions(2);
    try {
      await level.promptEdit();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('The level cannot be edited');
    }
  });
});
