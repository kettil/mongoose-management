import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import { mergeEvaluation } from '../helper/evaluation';

import * as cIndex from './columnIndex';
import * as cMain from './columnMain';
import * as cOptions from './columnOptions';
import * as cSubType from './columnSubType';

export const execute = async (prompts: Prompts, parent: CollectionDataset | ColumnDataset, column?: ColumnDataset) => {
  const collection = parent instanceof ColumnDataset ? parent.getCollection() : parent;

  const answersMain = await cMain.call(prompts, parent, column);

  const answersSubType = await cSubType.call(prompts, answersMain, column);
  const answersOptions = await cOptions.call(prompts, column);
  const answersIndex = await cIndex.call(prompts, answersMain, column);

  return mergeEvaluation<ColumnDataset>(
    cMain.evaluation(answersMain, parent, collection),
    [cSubType.evaluation(answersSubType), cOptions.evaluation(answersOptions), cIndex.evaluation(answersIndex)],
    column,
  );
};

export default execute;
