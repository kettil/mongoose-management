import { Separator } from 'inquirer';

import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';

import AbstractMenu from './abstract';

import { choicesType } from '../../types';

export default class GroupsMenu extends AbstractMenu<GroupsDataset, GroupDataset> {
  /**
   *
   * @param groups
   */
  async exec(groups: GroupsDataset) {
    const choices = this.getChoiceList(groups.getGroups());

    if (choices.length === 0) {
      choices.push(new Separator('- No groups defined -'));
    }

    const result = await this.prompt.menu<GroupDataset>('Choose a group or a command:', [
      new Separator('Group list'),
      new Separator(' '),
      ...choices,
      new Separator(' '),
      new Separator(),
      this.getMenuChoiceCreate('group'),
      this.getMenuChoiceSave(),
      this.getMenuChoiceExit(),
      new Separator(' '),
    ]);

    return result;
  }

  /**
   *
   * @param groups
   */
  getChoiceList(groups: GroupDataset[]): Array<choicesType<GroupDataset>> {
    return groups.map((d) => ({ name: d.getPath(), value: { data: d }, short: d.getPath() }));
  }
}
