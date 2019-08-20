import { Separator } from 'inquirer';

import AbstractHandler from './abstract';

import {
  choicesType,
  choiceType,
  choiceValueSubType,
  choiceValueType,
  dataCollectionType,
  dataColumnGroupType,
} from '../../types';

/**
 *
 */
export default class ColumnHandler extends AbstractHandler<
  dataColumnGroupType,
  choiceValueSubType,
  dataCollectionType
> {
  /**
   *
   */
  async menu(): Promise<choiceValueType<choiceValueSubType>> {
    const name = this.options.actionColumn.getPathName(this.data);
    let items: Array<choicesType<choiceValueSubType>> = [];

    const isObj = this.data.column.type === 'object';
    const isArr = this.data.column.type === 'array';

    if (isObj || isArr) {
      items = this.options.actionColumn.getMenuItems(
        this.data.column.subColumns || [],
        this.parent.indexes,
        name + '.',
      );
      items.push(new Separator());
      items.push(this.getMenuItemCreate(`subcolumn`, { type: 'column' }));
    }

    const value = await this.options.prompts.menu<choiceType<choiceValueSubType>, choiceValueSubType>(
      `Choose a subcolumn or a command for the column "${name}":`,
      [
        ...items,
        this.getMenuItemEdit(`column`),
        this.getMenuItemRemove(`column`),
        this.getMenuItemBack(),
        new Separator(' '),
      ],
    );

    return value;
  }

  /**
   *
   */
  async create(): Promise<choiceValueSubType | false> {
    const column = await this.options.actionColumn.create(
      this.data.column.subColumns || [],
      this.parent.indexes,
      this.options.actionColumn.getPathName(this.data, true, true) + '.',
    );

    if (column === false) {
      return false;
    }

    if (!this.data.column.subColumns) {
      this.data.column.subColumns = [];
    }

    // add column
    this.data.column.subColumns.push(column);
    this.data.column.subColumns.sort(this.options.actionColumn.sort);
    this.parent.indexes.sort(this.options.actionIndex.sort);

    if (column.type === 'object' || column.type === 'array') {
      return {
        type: 'column',
        data: column,
      };
    }

    return false;
  }

  /**
   *
   * @param value
   */
  async edit(): Promise<boolean> {
    if (this.data.parent) {
      // sub column
      if (this.data.parent.column.subColumns) {
        await this.options.actionColumn.edit(
          this.data.parent.column.subColumns,
          this.data.column,
          this.parent.indexes,
          this.options.actionColumn.getPathName(this.data, false, true) + '.',
        );

        this.data.parent.column.subColumns.sort(this.options.actionColumn.sort);
      }
    } else {
      // collection
      await this.options.actionColumn.edit(this.parent.columns, this.data.column, this.parent.indexes);

      this.parent.columns.sort(this.options.actionColumn.sort);
    }

    this.parent.indexes = this.parent.indexes.filter(Boolean);
    this.parent.indexes.sort(this.options.actionIndex.sort);

    return this.data.column.type === 'object' || this.data.column.type === 'array';
  }

  /**
   *
   * @param value
   */
  async remove(): Promise<boolean> {
    const collection = this.parent;
    const parent = this.data.parent;
    const name = this.options.actionColumn.getPathName(this.data, true, true);
    const index = this.options.actionColumn.getIndex(name, collection.indexes);

    // Sub-Columns
    if (this.data.column.subColumns && this.data.column.subColumns.length > 0) {
      await this.options.prompts.pressKey('There are still subcolumns. These must be deleted first!', true);

      return true;
    }

    // Indexes
    const columnIndexes = collection.indexes.filter((i) => i !== index && typeof i.columns[name] !== 'undefined');
    if (columnIndexes.length > 0) {
      const messages = [
        'Indexes still exist for the column. These must be deleted first!',
        '',
        'The following indexes contain the column:',
        '',
      ].concat(columnIndexes.map((i) => `- ${i.name}`));

      await this.options.prompts.pressKey(messages, true);

      return false;
    }

    // action
    const isConfirm = await this.options.prompts.remove();

    if (isConfirm) {
      // remove column
      if (parent) {
        if (parent.column.subColumns) {
          parent.column.subColumns = parent.column.subColumns.filter((c) => c !== this.data.column);
        }
      } else {
        collection.columns = collection.columns.filter((c) => c !== this.data.column);
      }

      // remove index, if exists
      if (index) {
        collection.indexes = collection.indexes.filter((i) => i !== index);
      }
    }

    return false;
  }

  /**
   *
   * @param value
   */
  async show(value: choiceValueSubType): Promise<void> {
    if (value.type === 'column' && value.data) {
      if (!this.data.column.subColumns) {
        throw new Error('tthe parent column does not have subcolumns!');
      }

      const column = value.data;
      const columns = this.data.column.subColumns.filter((c) => c.name === column.name);

      if (columns.length !== 1) {
        throw new Error('The selected subcolumn was not found in the parent column!');
      }

      const handler = new this.options.Column({ column: columns[0], parent: this.data }, this.parent, this.options);

      await handler.exec();
    }
  }
}
