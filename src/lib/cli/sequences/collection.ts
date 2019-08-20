import chalk from 'chalk';
import { Separator } from 'inquirer';

import AbstractHandler from './abstract';

import { choiceType, choiceValueSubType, choiceValueType, dataCollectionType, dataGroupType } from '../../types';

/**
 *
 */
export default class CollectionsHandler extends AbstractHandler<dataCollectionType, choiceValueSubType, dataGroupType> {
  /**
   *
   */
  async menu(): Promise<choiceValueType<choiceValueSubType>> {
    const itemsColumns = this.options.actionColumn.getMenuItems(this.data.columns, this.data.indexes);
    const itemsIndexes = this.options.actionIndex.getMenuItems(this.data.indexes);

    const value = await this.options.prompts.menu<choiceType<choiceValueSubType>, choiceValueSubType>(
      'Choose a column/index or a command:',
      [
        new Separator(`Collection: ${chalk.bold(this.data.name)}`),
        new Separator(' '),
        ...itemsColumns,
        ...itemsIndexes,
        new Separator(),
        this.getMenuItemCreate('column', { type: 'column' }),
        this.getMenuItemCreate('index', { type: 'index' }),
        this.getMenuItemEdit('collection'),
        this.getMenuItemRemove('collection'),
        this.getMenuItemBack(),
        new Separator(' '),
      ],
    );

    return value;
  }

  /**
   *
   */
  async create(value?: choiceValueSubType): Promise<choiceValueSubType | false> {
    if (value) {
      switch (value.type) {
        case 'column':
          const column = await this.options.actionColumn.create(this.data.columns, this.data.indexes);

          if (column) {
            // add column
            this.data.columns.push(column);
            this.data.columns.sort(this.options.actionColumn.sort);
            this.data.indexes.sort(this.options.actionIndex.sort);

            if (column.type === 'object' || column.type === 'array') {
              return {
                type: 'column',
                data: column,
              };
            }
          }
          break;

        case 'index':
          const columns = this.options.actionColumn.getColumnItems(this.data.columns, true);

          const index = await this.options.actionIndex.create(this.data.indexes, columns);

          if (index) {
            this.data.indexes.push(index);
            this.data.indexes.sort(this.options.actionIndex.sort);
          }
      }
    }

    return false;
  }

  /**
   *
   */
  async edit(): Promise<boolean> {
    await this.options.actionCollection.edit(this.parent.collections, this.data);

    return true;
  }

  /**
   *
   */
  async remove(): Promise<boolean> {
    const collections = await this.options.actionCollection.remove([this.data]);

    if (collections) {
      this.parent.collections = this.parent.collections.filter((c) => collections.indexOf(c.name) === -1);
    }

    return false;
  }

  /**
   *
   * @param value
   */
  async show(value: choiceValueSubType): Promise<void> {
    switch (value.type) {
      case 'column':
        if (value.data) {
          const column = value.data;
          const columns = this.data.columns.filter((c) => c.name === column.name);

          if (columns.length !== 1) {
            throw new Error('The selected column was not found in the collection!');
          }

          const handler = new this.options.Column({ column: columns[0] }, this.data, this.options);

          await handler.exec();
        }
        break;

      case 'index':
        if (value.data) {
          const index = value.data;
          const indexes = this.data.indexes.filter((i) => i.name === index.name);

          if (indexes.length !== 1) {
            throw new Error('The selected index was not found in the collection!');
          }

          const handler = new this.options.Index(indexes[0], this.data, this.options);

          await handler.exec();
        }
        break;
    }
  }
}
