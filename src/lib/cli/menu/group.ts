import chalk from 'chalk';
import { Separator } from 'inquirer';

import CollectionDataset from '../dataset/collection';
import GroupDataset from '../dataset/group';
import AbstractMenu from './abstract';

import { choicesType } from '../../types';

export default class GroupMenu extends AbstractMenu<GroupDataset, CollectionDataset> {
  async exec(group: GroupDataset) {
    const choices = this.getChoiceList(group.getCollections());

    if (choices.length === 0) {
      choices.push(new Separator('- No collections defined -'));
    }

    const result = await this.prompts.menu<CollectionDataset>('Choose a collection or a command:', [
      new Separator(`Group: ${chalk.reset.bold(group.getPath())}`),
      new Separator(' '),
      new Separator('Collections list'),
      new Separator(' '),
      ...choices,
      new Separator(' '),
      new Separator(),
      this.getMenuChoiceCreate('collection'),
      this.getMenuChoiceEdit('group'),
      this.getMenuChoiceRemove('group'),
      this.getMenuChoiceSave(),
      this.getMenuChoiceWrite(),
      this.getMenuChoiceBack(),
      new Separator(' '),
    ]);

    return result;
  }

  getChoiceList(collections: CollectionDataset[]): choicesType<CollectionDataset>[] {
    return collections.map((d) => ({ name: d.getName(), value: { data: d }, short: d.getName() }));
  }
}
