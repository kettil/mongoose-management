import { indexColumnValues } from '../../mongo';
import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import IndexDataset from '../dataset/index';

import * as main from './indexMain';

import { dataIndexColumnValueType } from '../../types';

/**
 *
 */
export type answersType = { [K: string]: dataIndexColumnValueType };

/**
 *
 * @param prompts
 * @param answersMain
 * @param index
 */
export const call = async (
  prompts: Prompts,
  answersMain: main.answersType,
  collection: CollectionDataset,
  index?: IndexDataset,
): Promise<answersType> => {
  const questions = getQuestions(answersMain, index);
  const answersColumns = await prompts.call<answersType>(questions);

  collection.getIndexes().forEach((i) => {
    if (i !== index && equalIndexColumns(answersColumns, i.getColumns())) {
      throw new Error(`An index with the column configuration already exists! (duplicate index: "${i.getName()}")`);
    }
  });

  return answersColumns;
};

/**
 *
 * @param answersMain
 * @param index
 */
export const getQuestions = (answersMain: main.answersType, index?: IndexDataset): ReadonlyArray<any> => {
  return answersMain.columns.map((name) => {
    const columns = index ? index.getColumns() : {};
    const column = columns[name];

    return {
      type: 'list',
      name,
      message: `Choose a index type for "${name}":`,
      choices: indexColumnValues,
      default: typeof column !== 'undefined' ? indexColumnValues.indexOf(column) : undefined,
    };
  });
};

/**
 *
 * @param answers
 */
export const evaluation = (answers: answersType) => {
  return (index: IndexDataset): IndexDataset => {
    index.setColumns(answers);

    return index;
  };
};

/**
 *
 * @param a
 * @param b
 */
export const equalIndexColumns = (a: IndexDataset['columns'], b: IndexDataset['columns']): boolean => {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);

  if (aKeys.length !== bKeys.length) {
    return false;
  }

  for (const key of aKeys) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
};
