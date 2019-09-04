import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import GroupDataset from '../dataset/group';
import IndexDataset from '../dataset/index';

import CollectionMenu from '../menu/collection';

import promptsCollection from '../prompts/collection';
import promptsColumn from '../prompts/column';
import promptsIndex from '../prompts/index';

import AbstractLevel from './abstract';
import ColumnLevel from './column';
import IndexLevel from './index';

import { choiceValueType, levelOptionsType } from '../../types';

/**
 *
 */
export default class CollectionLevel extends AbstractLevel<
  CollectionDataset,
  ColumnDataset | IndexDataset,
  CollectionMenu,
  GroupDataset
> {
  protected promptEdit = promptsCollection;

  /**
   *
   * @param dataset
   * @param prompts
   */
  constructor(dataset: CollectionDataset, options: levelOptionsType) {
    super(dataset, new CollectionMenu(options.prompts), options);
  }

  /**
   *
   * @param action
   */
  async create(action: choiceValueType<undefined>['action']) {
    let dataset: ColumnDataset | IndexDataset | undefined;

    if (action === 'createIndex') {
      await promptsIndex(this.prompts, this.dataset);
    } else {
      dataset = await promptsColumn(this.prompts, this.dataset);

      if (dataset.get('type') !== 'array' && dataset.get('type') !== 'object') {
        dataset = undefined;
      }
    }

    return dataset;
  }

  /**
   *
   * @param dataset
   */
  async show(dataset: ColumnDataset | IndexDataset): Promise<void> {
    if (dataset instanceof ColumnDataset) {
      const level = new ColumnLevel(dataset, this.options);

      await level.exec();

      return;
    }

    if (dataset instanceof IndexDataset) {
      const level = new IndexLevel(dataset, this.options);

      await level.exec();

      return;
    }

    throw new Error('Unknown dataset instance');
  }

  /**
   *
   */
  protected promptCreate = () => {
    throw new Error('Creating action is not done in the abstract class');
  };
}
