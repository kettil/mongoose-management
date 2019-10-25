import chalk from 'chalk';

import Prompts from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import * as main from './columnMain';
import * as subType from './columnSubType';

export type answersType = { collection?: CollectionDataset; column?: ColumnDataset };

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
  const selectedCollection = populate
    ? collections.indexOf(populate instanceof ColumnDataset ? populate.getCollection() : populate)
    : -1;

  const choices: any[] = [{ name: '- Without reference -', short: chalk.red('Without reference'), value: undefined }];

  return [
    {
      type: 'list',
      name: 'collection',
      message: 'Choose a reference collection',
      choices: [...choices, ...collections.map((c) => ({ name: c.getName(), short: c.getName(), value: c }))],
      default: populate ? selectedCollection + choices.length : undefined,
    },
    {
      type: 'list',
      name: 'column',
      message: 'Choose a column with nested schemas or the collection',
      choices: choicesColumn,
      default: defaultColumn(populate),
      when: whenColumn,
    },
  ];
};

export const evaluation = (answers: answersType) => {
  return (column: ColumnDataset): ColumnDataset => {
    if (answers.collection && answers.column) {
      column.setPopulate(answers.column);
    } else {
      column.setPopulate(answers.collection);
    }

    return column;
  };
};

export const getCollectionWithNestedSchemas = (collection: CollectionDataset) =>
  collection.flatColumns().filter((c) => ['object', 'array'].indexOf(c.get('type')) >= 0);

export const whenColumn = ({ collection }: answersType) =>
  collection !== undefined && getCollectionWithNestedSchemas(collection).length > 0;

export const choicesColumn = ({ collection }: answersType) => {
  if (!collection) {
    throw new Error('No collection has been selected');
  }

  const columnChoices = getCollectionWithNestedSchemas(collection).map((c) => ({
    name: c.getFullname(false, false),
    short: c.getFullname(false, false),
    value: c,
  }));

  return [{ name: '_id', short: `${collection.getName()}._id`, value: undefined }, ...columnChoices];
};

export const defaultColumn = (prevPopulate?: CollectionDataset | ColumnDataset) => ({ collection }: answersType) => {
  if (prevPopulate instanceof ColumnDataset && prevPopulate.getCollection() === collection) {
    return getCollectionWithNestedSchemas(collection).indexOf(prevPopulate) + 1;
  }

  return -1;
};
