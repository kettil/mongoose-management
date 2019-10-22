import Prompts from '../../prompts';

import CollectionDataset from '../dataset/collection';
import IndexDataset from '../dataset/index';

import { mergeEvaluation } from '../helper/evaluation';

import * as cColumns from './indexColumns';
import * as cMain from './indexMain';
import * as cOptions from './indexOptions';

export const execute = async (prompts: Prompts, collection: CollectionDataset, index?: IndexDataset) => {
  const answersMain = await cMain.call(prompts, collection, index);

  const answersColumns = await cColumns.call(prompts, answersMain, collection, index);
  const answersOptions = await cOptions.call(prompts, index);

  return mergeEvaluation<IndexDataset>(
    cMain.evaluation(answersMain, collection),
    [cColumns.evaluation(answersColumns), cOptions.evaluation(answersOptions)],
    index,
  );
};

export default execute;
