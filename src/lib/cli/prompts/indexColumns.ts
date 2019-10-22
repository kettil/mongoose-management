import { indexColumnValues } from '../../mongo';
import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import IndexDataset from '../dataset/index';
import * as main from './indexMain';

import { Unpacked } from '../../types';

export type answersType = { [K: string]: Unpacked<IndexDataset['columns']> };

export const call = async (
  prompts: Prompts,
  answersMain: main.answersType,
  collection: CollectionDataset,
  index?: IndexDataset,
): Promise<answersType> => {
  const questions = getQuestions(answersMain, index);
  const answersColumns = await prompts.call<answersType>(questions);
  const answersNormalize = normalizer(answersColumns);

  /*
{
  name: 'bla',
  columns: [
    ColumnDataset {
      parent: [ColumnDataset],
      column: [Object],
      collection: [CollectionDataset],
      readonly: false,
      columns: [],
      subTypes: [],
      index: undefined
    },
    ColumnDataset {
      parent: [ColumnDataset],
      column: [Object],
      collection: [CollectionDataset],
      readonly: false,
      columns: [],
      subTypes: [],
      index: undefined
    }
  ]
}
{ content: { updatedAt: { date: [Array], user: [Array] } } }

  */

  collection.getIndexes().forEach((i) => {
    if (i !== index && equalIndexColumns(answersColumns, i.getColumns())) {
      throw new Error(`An index with the column configuration already exists! (duplicate index: "${i.getName()}")`);
    }
  });

  return answersNormalize;
};

export const getQuestions = (answersMain: main.answersType, index?: IndexDataset): ReadonlyArray<any> => {
  const columns = index ? index.getColumnsNormalize() : {};

  return answersMain.columns.map((column) => {
    const name = column.getFullname(false, false);
    const dValue = indexColumnValues.indexOf(columns[name]);
    const choices = indexColumnValues.map((value) => ({ name: value, value: [column, value], short: value }));

    return {
      type: 'list',
      name,
      message: `Choose a index type for "${name}":`,
      choices,
      default: dValue,
    };
  });
};

export const evaluation = (answers: answersType) => {
  return (index: IndexDataset): IndexDataset => {
    index.setColumns(Object.values(answers));

    return index;
  };
};

export const normalizer = (answers: answersType | { [K: string]: answersType }, names: string[] = []): answersType => {
  let data: answersType = {};

  Object.keys(answers).forEach((key) => {
    const value = answers[key];
    if (Array.isArray(value)) {
      data[[...names, key].join('.')] = value;
    } else {
      data = { ...data, ...normalizer(value, [...names, key]) };
    }
  });

  return data;
};

export const equalIndexColumns = (answers: answersType, columns: IndexDataset['columns']): boolean => {
  const keys = Object.keys(answers);

  if (keys.length !== columns.length) {
    return false;
  }

  for (const [column, value] of columns) {
    const name = column.getFullname(false, false);
    const answer = answers[name];

    if (!Array.isArray(answer) || answer[0] !== column || answer[1] !== value) {
      return false;
    }
  }

  return true;
};
