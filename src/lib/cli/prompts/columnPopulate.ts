import chalk from 'chalk';

import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import * as main from './columnMain';
import * as subType from './columnSubType';

export type answersType = { populate?: CollectionDataset };

export const call = async (
  prompts: Prompts,
  collection: CollectionDataset,
  answersMain: main.answersType,
  answersSubType: subType.answersType,
  column?: ColumnDataset,
): Promise<answersType> => {
  if (
    answersMain.type !== 'objectId' &&
    (answersMain.type !== 'arrayType' || answersSubType[answersSubType.length - 1] !== 'objectId')
  ) {
    return {};
  }

  const questions = getQuestions(collection, column);
  const answersPopulate = await prompts.call<answersType>(questions);

  return answersPopulate;
};

export const getQuestions = (collection: CollectionDataset, column?: ColumnDataset): ReadonlyArray<any> => {
  const populate = column && column.getPopulate();
  const collections = collection.getParent().getCollections();

  const choices: any[] = [{ name: '- Without reference -', short: chalk.red('Without reference'), value: undefined }];

  return [
    {
      type: 'list',
      name: 'populate',
      message: 'Choose a reference collection',
      choices: [...choices, ...collections.map((c) => ({ name: c.getName(), short: c.getName(), value: c }))],
      default: populate ? collections.indexOf(populate) + choices.length : undefined,
    },
  ];
};

export const evaluation = (answers: answersType) => {
  return (column: ColumnDataset): ColumnDataset => {
    column.setPopulate(answers.populate);

    return column;
  };
};
