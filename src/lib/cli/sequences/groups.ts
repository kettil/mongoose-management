import { inspect } from 'util';

import { Separator } from 'inquirer';

import AbstractHandler from './abstract';

import { choicesType, choiceType, choiceValueType, dataGroupType, dataType } from '../../types';

export default class GroupsHandler extends AbstractHandler<dataGroupType[], dataGroupType, dataType> {
  /**
   *
   */
  async menu(): Promise<choiceValueType<dataGroupType>> {
    const items: Array<choicesType<dataGroupType>> = this.options.actionGroup.getMenuItems(this.data);

    if (items.length === 0) {
      items.push(new Separator(`- No groups defined -`));
    }

    const value = await this.options.prompts.menu<choiceType<dataGroupType>, dataGroupType>(
      'Choose a group or a command:',
      [
        new Separator('Group list'),
        new Separator(' '),
        ...items,
        new Separator(' '),
        new Separator(),
        this.getMenuItemCreate('group'),
        this.getMenuItemRemove('group(s)'),
        this.getMenuItemSave(),
        this.getMenuItemExit(),
        new Separator(' '),
      ],
    );

    return value;
  }

  /**
   *
   */
  async create(): Promise<dataGroupType | false> {
    const group = await this.options.actionGroup.create(this.data);

    if (group) {
      this.data.push(group);
      this.data.sort(this.options.actionGroup.sort);
    }

    return group;
  }

  /**
   *
   */
  async edit(): Promise<boolean> {
    return true;
  }

  /**
   *
   * @param value
   */
  async remove(): Promise<boolean> {
    const groups = await this.options.actionGroup.remove(this.data);

    if (groups) {
      this.data = this.parent.groups = this.parent.groups.filter((c) => groups.indexOf(c.path) === -1);
    }

    return true;
  }

  /**
   *
   * @param value
   */
  async show(value: dataGroupType): Promise<void> {
    try {
      const handler = new this.options.Collections(value.collections, value, this.options);

      await handler.exec();
    } catch (err) {
      if (err instanceof Error) {
        await this.options.prompts.pressKey(err.stack ? err.stack.split('\n') : `${err.name}: ${err.message}`, true);
      } else {
        await this.options.prompts.pressKey(inspect(err, true, undefined, true).split('\n'), true);
      }
    }
  }
}
