import chalk from 'chalk';

import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import GroupDataset from '../dataset/group';
import IndexDataset from '../dataset/index';
import { BackToCollectionError } from '../errors';
import CollectionMenu from '../menu/collection';
import promptsCollection from '../prompts/collection';
import promptsColumn from '../prompts/column';
import promptsIndex from '../prompts/index';
import AbstractLevel from './abstract';
import ColumnLevel from './column';
import IndexLevel from './index';

import { choiceValueType, levelOptionsType } from '../../types';

export default class CollectionLevel extends AbstractLevel<
  CollectionDataset,
  ColumnDataset | IndexDataset,
  CollectionMenu,
  GroupDataset
> {
  protected promptEdit = promptsCollection;

  constructor(dataset: CollectionDataset, options: levelOptionsType) {
    super(dataset, new CollectionMenu(options.prompts), options);
  }

  async create(action: choiceValueType<undefined>['action']) {
    let dataset: ColumnDataset | IndexDataset | undefined;

    switch (action) {
      case 'createIndex':
        await promptsIndex(this.prompts, this.dataset);
        break;

      case 'createColumn':
        dataset = await promptsColumn(this.prompts, this.dataset);

        if (dataset.get('type') !== 'array' && dataset.get('type') !== 'object') {
          dataset = undefined;
        }
        break;

      default:
        throw new Error('Unknown action');
    }

    return dataset;
  }

  async remove(dataset: CollectionDataset): Promise<boolean> {
    const populates = dataset
      .getPopulates(false)
      .map((c) => `- ${chalk.bold(c.getCollection().getName())}.${c.getFullname(false, false)}`);

    if (populates.length > 0) {
      throw new Error(
        [
          'This collection is referenced by other column(s):',
          '',
          ...populates,
          '',
          'The references must first be deleted',
        ].join('\n'),
      );
    }

    const result = await super.remove(dataset);

    return result;
  }

  async show(dataset: ColumnDataset | IndexDataset): Promise<void> {
    try {
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
    } catch (err) {
      if (err instanceof BackToCollectionError) {
        return;
      }

      throw err;
    }

    throw new Error('Unknown dataset instance');
  }

  protected promptCreate = () => {
    throw new Error('Creating action is not done in the abstract class');
  };
}
