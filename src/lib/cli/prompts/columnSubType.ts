import { schemaTypesNormal } from '../../mongo';
import Prompts from '../../prompts';
import ColumnDataset from '../dataset/column';
import * as main from './columnMain';

import { choiceListType, schemaNormalType } from '../../types';

export type answersType = schemaNormalType[];

export type answersInternalType = { type: schemaNormalType };

export const call = async (
  prompts: Prompts,
  answersMain: main.answersType,
  column?: ColumnDataset,
): Promise<answersType> => {
  if (answersMain.type !== 'arrayType') {
    return [];
  }

  const answersSubType: answersType = [];
  const subTypes: answersType = column ? [...column.getSubTypes()] : [];

  let type: schemaNormalType;

  do {
    const questions = getQuestions(subTypes.shift());
    const answersSubTypePart = await prompts.call<answersInternalType>(questions);

    type = answersSubTypePart.type;

    answersSubType.push(type);
  } while (type === 'arrayType');

  return answersSubType;
};

export const getQuestions = (subType?: schemaNormalType): ReadonlyArray<any> => {
  const typeValue = subType ? Object.keys(schemaTypesNormal).indexOf(subType) : undefined;
  const typeValues = Object.entries(schemaTypesNormal).map<choiceListType<string>>(([key, value]) => ({
    name: value.name,
    value: key,
    short: value.name,
  }));

  return [
    {
      type: 'list',
      name: 'type',
      message: 'Choose a SchemaSubType',
      choices: typeValues,
      default: typeValue,
    },
  ];
};

export const evaluation = (answers: answersType) => {
  return (column: ColumnDataset): ColumnDataset => {
    column.setSubTypes(answers);

    return column;
  };
};
