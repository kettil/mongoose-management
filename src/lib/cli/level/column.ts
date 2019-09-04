import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';

import ColumnMenu from '../menu/column';

import promptsColumn from '../prompts/column';

import AbstractLevel from './abstract';

import { choiceValueType, levelOptionsType } from '../../types';

/**
 *
 */
export default class ColumnLevel extends AbstractLevel<
  ColumnDataset,
  ColumnDataset,
  ColumnMenu,
  CollectionDataset | ColumnDataset
> {
  protected promptCreate = promptsColumn;
  protected promptEdit = promptsColumn;

  /**
   *
   * @param group
   * @param prompts
   */
  constructor(dataset: ColumnDataset, options: levelOptionsType) {
    super(dataset, new ColumnMenu(options.prompts), options);
  }

  /**
   *
   * @param action
   */
  async create(action: choiceValueType<undefined>['action']) {
    const dataset = await super.create(action);

    if (dataset && dataset.get('type') !== 'array' && dataset.get('type') !== 'object') {
      return undefined;
    }

    return dataset;
  }

  /**
   *
   * @param dataset
   */
  async remove(dataset: ColumnDataset): Promise<boolean> {
    if (dataset.getColumns().length > 0) {
      throw new Error('There are still subcolumns. These must be deleted first!');
    }

    const name = dataset.getFullname(false, false);
    const index = dataset.getIndex();
    const indexes = dataset
      .getCollection()
      .getIndexes()
      .filter((d) => d !== index && typeof d.getColumns()[name] !== 'undefined');
    if (indexes.length > 0) {
      const messages = [
        'Indexes still exist for the column. These must be deleted first!',
        '',
        'The following indexes contain the column:',
      ].concat(indexes.map((i) => `- ${i.getName()}`));

      throw new Error(messages.join('\n'));
    }

    const result = await super.remove(dataset);

    return result;
  }

  /**
   *
   * @param dataset
   */
  async show(dataset: ColumnDataset): Promise<void> {
    const level = new ColumnLevel(dataset, this.options);

    await level.exec();
  }
}
