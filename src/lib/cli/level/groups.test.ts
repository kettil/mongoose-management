jest.mock('../../prompts');
jest.mock('../../storage');
jest.mock('../../template/create');
jest.mock('../dataset/group');
jest.mock('../dataset/groups');
jest.mock('../menu/groups');
jest.mock('../prompts/group');
jest.mock('./group');

import Prompts from '../../prompts';
import Storage from '../../storage';
import Creater from '../../template/create';

import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';

import GroupsMenu from '../menu/groups';

import promptsGroup from '../prompts/group';

import GroupLevel from './group';

import GroupsLevel from './groups';

import { levelOptionsType } from '../../types';

/**
 *
 */
describe('Check the GroupsLevel class', () => {
  let level: any;
  let dataset: any;
  let prompts: any;
  let options: levelOptionsType;

  /**
   *
   */
  beforeEach(() => {
    const storage = new (Storage as any)();
    const creater = new (Creater as any)();
    prompts = new (Prompts as any)();
    dataset = new (GroupsDataset as any)();
    options = { prompts, storage, creater };

    level = new GroupsLevel(dataset, options);
  });

  /**
   *
   */
  test('initialize the class', () => {
    expect(level).toBeInstanceOf(GroupsLevel);

    expect(level.dataset).toBe(dataset);
    expect(level.menu).toBeInstanceOf(GroupsMenu);
    expect(level.prompts).toBe(prompts);
    expect(level.options).toBe(options);

    expect(level.promptCreate).toEqual(expect.any(Function));
    expect(level.promptEdit).toEqual(expect.any(Function));

    expect(level.promptCreate).toBe(promptsGroup);
  });

  /**
   *
   */
  test('it should be create GroupLevel when show() is called', async () => {
    const mock = new (GroupDataset as any)();

    await level.show(mock);

    expect(GroupLevel).toHaveBeenCalledTimes(1);
    expect(GroupLevel).toHaveBeenCalledWith(mock, options);

    expect(GroupLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(GroupLevel.prototype.exec).toHaveBeenCalledWith();
  });

  /**
   *
   */
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
