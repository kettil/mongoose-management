import CollectionDataset from '../dataset/collection';
import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';

import GroupMenu from '../menu/group';

import promptsCollection from '../prompts/collection';
import promptsGroup from '../prompts/group';

import AbstractLevel from './abstract';
import CollectionLevel from './collection';

import { levelOptionsType } from '../../types';

/**
 *
 */
export default class GroupLevel extends AbstractLevel<GroupDataset, CollectionDataset, GroupMenu, GroupsDataset> {
  protected promptCreate = promptsCollection;
  protected promptEdit = promptsGroup;

  /**
   *
   * @param group
   * @param prompts
   */
  constructor(dataset: GroupDataset, options: levelOptionsType) {
    super(dataset, new GroupMenu(options.prompts), options);
  }

  /**
   *
   * @param dataset
   */
  async show(dataset: CollectionDataset) {
    const level = new CollectionLevel(dataset, this.options);

    await level.exec();
  }
}
