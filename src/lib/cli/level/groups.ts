import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';

import GroupsMenu from '../menu/groups';

import promptsGroup from '../prompts/group';

import AbstractLevel from './abstract';
import GroupLevel from './group';

import { levelOptionsType } from '../../types';

/**
 *
 */
export default class GroupsLevel extends AbstractLevel<GroupsDataset, GroupDataset, GroupsMenu> {
  protected promptCreate = promptsGroup;

  /**
   *
   * @param groups
   * @param prompts
   */
  constructor(dataset: GroupsDataset, options: levelOptionsType) {
    super(dataset, new GroupsMenu(options.prompts), options);
  }

  /**
   *
   * @param dataset
   */
  async show(dataset: GroupDataset): Promise<void> {
    const level = new GroupLevel(dataset, this.options);

    await level.exec();
  }

  /**
   *
   */
  protected promptEdit = () => {
    throw new Error('The level cannot be edited');
  };
}
