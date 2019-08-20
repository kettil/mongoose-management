import chalk from 'chalk';
import { Separator } from 'inquirer';

import AbstractHandler from './abstract';

import { choicesType, choiceType, choiceValueType, dataCollectionType, dataGroupType } from '../../types';

/**
 *
 */
export default class CollectionsHandler extends AbstractHandler<
  dataCollectionType[],
  dataCollectionType,
  dataGroupType
> {
  /**
   *
   */
  async menu(): Promise<choiceValueType<dataCollectionType>> {
    const items: Array<choicesType<dataCollectionType>> = this.options.actionCollection.getMenuItems(this.data);

    if (items.length === 0) {
      items.push(new Separator(`- No collections defined -`));
    }

    const value = await this.options.prompts.menu<choiceType<dataCollectionType>, dataCollectionType>(
      'Choose a collection or a command:',
      [
        new Separator(`Group: ${chalk.bold(this.parent.path)}`),
        new Separator(' '),
        new Separator('Collections list'),
        new Separator(' '),
        ...items,
        new Separator(' '),
        new Separator(),
        this.getMenuItemCreate('collection'),
        this.getMenuItemRemove('collection(s)'),
        this.getMenuItemSave(),
        this.getMenuItemWrite(),
        this.getMenuItemBack(),
        new Separator(' '),
      ],
    );

    return value;
  }

  /**
   *
   */
  async create(): Promise<dataCollectionType | false> {
    const collection = await this.options.actionCollection.create(this.data);

    if (collection) {
      this.data.push(collection);
      this.data.sort(this.options.actionCollection.sort);
    }

    return collection;
  }

  /**
   *
   * @param value
   */
  async edit(): Promise<boolean> {
    return false;
  }

  /**
   *
   */
  async remove(): Promise<boolean> {
    const collections = await this.options.actionCollection.remove(this.data);

    if (collections) {
      this.data = this.parent.collections = this.parent.collections.filter((c) => collections.indexOf(c.name) === -1);
    }

    return true;
  }

  /**
   *
   * @param value
   */
  async show(value: dataCollectionType): Promise<void> {
    const handler = new this.options.Collection(value, this.parent, this.options);

    await handler.exec();

    if (this.parent.collections !== this.data) {
      // updatet collections list
      this.data = this.parent.collections;
    }
  }
}
