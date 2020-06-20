import CollectionDataset from '../dataset/collection';
import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';

import GroupMenu from '../menu/group';

import promptsCollection from '../prompts/collection';
import promptsGroup from '../prompts/group';

import AbstractLevel from './abstract';
import CollectionLevel from './collection';

import { levelOptionsType } from '../../types';

export default class GroupLevel extends AbstractLevel<GroupDataset, CollectionDataset, GroupMenu, GroupsDataset> {
  protected promptCreate = promptsCollection;
  protected promptEdit = promptsGroup;

  constructor(dataset: GroupDataset, options: levelOptionsType) {
    super(dataset, new GroupMenu(options.prompts), options);
  }

  async edit(dataset: GroupDataset): Promise<boolean> {
    await super.edit(dataset);

    return true;
  }

  async show(dataset: CollectionDataset) {
    const level = new CollectionLevel(dataset, this.options);

    await level.exec();
  }
}
