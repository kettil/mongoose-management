import { Separator } from 'inquirer';

import AbstractHandler from './abstract';

import { choiceType, choiceValueSubType, choiceValueType, dataCollectionType, dataIndexType } from '../../types';

/**
 *
 */
export default class ColumnHandler extends AbstractHandler<dataIndexType, choiceValueSubType, dataCollectionType> {
  /**
   *
   */
  async menu(): Promise<choiceValueType<choiceValueSubType>> {
    const value = await this.options.prompts.menu<choiceType<choiceValueSubType>, choiceValueSubType>(
      `Choose a command for the index "${this.data.name}":`,
      [this.getMenuItemEdit(`index`), this.getMenuItemRemove(`index`), this.getMenuItemBack(), new Separator(' ')],
    );

    return value;
  }

  /**
   *
   */
  async create(): Promise<false> {
    return false;
  }

  /**
   *
   * @param value
   */
  async edit(): Promise<boolean> {
    const columns = this.options.actionColumn.getColumnItems(this.parent.columns, true);

    await this.options.actionIndex.edit(this.parent.indexes, this.data, columns);

    return false;
  }

  /**
   *
   * @param value
   */
  async remove(): Promise<boolean> {
    const isConfirm = await this.options.prompts.remove();

    if (isConfirm) {
      this.parent.indexes = this.parent.indexes.filter((i) => i !== this.data);
    }

    return false;
  }

  /**
   *
   */
  async show(): Promise<void> {
    // empty
  }
}
