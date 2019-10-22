jest.mock('./collection');

import GroupDataset from '../dataset/group';
import GroupMenu from '../menu/group';
import promptsCollection from '../prompts/collection';
import promptsGroup from '../prompts/group';
import CollectionLevel from './collection';

import GroupLevel from './group';

describe('Check the GroupLevel class', () => {
  let prompts: any;
  let storage: any;
  let creater: any;
  let dataset: GroupDataset;
  let level: any;

  beforeEach(() => {
    prompts = jest.fn();
    storage = jest.fn();
    creater = jest.fn();

    dataset = new GroupDataset({ path: 'subpath', collections: [] }, jest.fn() as any);
    level = new GroupLevel(dataset, { prompts, storage, creater });
  });

  test('initialize the class', () => {
    expect(level).toBeInstanceOf(GroupLevel);

    expect(level.dataset).toBeInstanceOf(GroupDataset);
    expect(level.menu).toBeInstanceOf(GroupMenu);
    expect(level.prompts).toBe(prompts);
    expect(level.options).toEqual({ prompts, storage, creater });

    expect(level.promptCreate).toBe(promptsCollection);
    expect(level.promptEdit).toBe(promptsGroup);
  });

  test('it should be create CollectionLevel when show() is called', async () => {
    const subDataset = jest.fn();

    await level.show(subDataset);

    expect(CollectionLevel).toHaveBeenCalledTimes(1);
    expect(CollectionLevel).toHaveBeenCalledWith(subDataset, { prompts, storage, creater });

    expect(CollectionLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(CollectionLevel.prototype.exec).toHaveBeenCalledWith();
  });
});
