jest.mock('../../prompts');
jest.mock('../../storage');
jest.mock('../../template/create');
jest.mock('../dataset/collection');
jest.mock('../dataset/group');

jest.mock('../menu/group');
jest.mock('../prompts/collection');
jest.mock('../prompts/group');
jest.mock('./collection');

import Prompts from '../../prompts';
import Storage from '../../storage';
import Creater from '../../template/create';

import CollectionDataset from '../dataset/collection';
import GroupDataset from '../dataset/group';

import GroupMenu from '../menu/group';

import promptsCollection from '../prompts/collection';
import promptsGroup from '../prompts/group';

import CollectionLevel from './collection';

import GroupLevel from './group';

import { levelOptionsType } from '../../types';

/**
 *
 */
describe('Check the GroupLevel class', () => {
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
    dataset = new (GroupDataset as any)();
    options = { prompts, storage, creater };

    level = new GroupLevel(dataset, options);
  });

  /**
   *
   */
  test('initialize the class', () => {
    expect(level).toBeInstanceOf(GroupLevel);

    expect(level.dataset).toBe(dataset);
    expect(level.menu).toBeInstanceOf(GroupMenu);
    expect(level.prompts).toBe(prompts);
    expect(level.options).toBe(options);

    expect(level.promptCreate).toEqual(expect.any(Function));
    expect(level.promptEdit).toEqual(expect.any(Function));

    expect(level.promptCreate).toBe(promptsCollection);
    expect(level.promptEdit).toBe(promptsGroup);
  });

  /**
   *
   */
  test('it should be create CollectionLevel when show() is called', async () => {
    const mock = new (CollectionDataset as any)();

    await level.show(mock);

    expect(CollectionLevel).toHaveBeenCalledTimes(1);
    expect(CollectionLevel).toHaveBeenCalledWith(mock, options);

    expect(CollectionLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(CollectionLevel.prototype.exec).toHaveBeenCalledWith();
  });
});
