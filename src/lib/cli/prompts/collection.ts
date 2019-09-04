import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import GroupDataset from '../dataset/group';
import { mergeEvaluation } from '../helper/evaluation';

import * as main from './collectionMain';

/**
 *
 * @param prompts
 * @param group
 * @param collection
 */
export const execute = async (prompts: Prompts, group: GroupDataset, collection?: CollectionDataset) => {
  const answersMain = await main.call(prompts, group, collection);

  return mergeEvaluation<CollectionDataset>(main.evaluation(answersMain, group), [], collection);
};

/**
 *
 */
export default execute;
