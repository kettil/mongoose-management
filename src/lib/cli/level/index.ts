import CollectionDataset from '../dataset/collection';
import IndexDataset from '../dataset/index';

import IndexMenu from '../menu/index';

import promptsIndex from '../prompts/index';

import AbstractLevel from './abstract';

import { levelOptionsType } from '../../types';

export default class IndexLevel extends AbstractLevel<IndexDataset, IndexDataset, any, CollectionDataset> {
  protected promptEdit = promptsIndex;

  constructor(dataset: IndexDataset, options: levelOptionsType) {
    super(dataset, new IndexMenu(options.prompts), options);
  }

  protected promptCreate = () => {
    throw new Error('No subindex can be created');
  };
}
