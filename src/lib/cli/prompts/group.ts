import Prompts from '../../prompts';
import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';
import { mergeEvaluation } from '../helper/evaluation';

import * as main from './groupMain';

/**
 *
 * @param prompts
 * @param groups
 * @param group
 */
export const execute = async (prompts: Prompts, groups: GroupsDataset, group?: GroupDataset) => {
  const answersMain = await main.call(prompts, groups);

  return mergeEvaluation<GroupDataset>(main.evaluation(answersMain, groups));
};

/**
 *
 */
export default execute;
