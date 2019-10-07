import { indexColumnValues, schemaIndexTypes, schemaTypesSpecial } from '../../mongo';
import Prompts from '../../prompts';

import ColumnDataset from '../dataset/column';

import * as main from './columnMain';

import { choiceListType, dataIndexColumnValueType, schemaIndexType } from '../../types';

const specialTypeKeys = Object.keys(schemaTypesSpecial);

export type answersType = { type: keyof typeof schemaIndexTypes; value?: dataIndexColumnValueType };

export const call = async (
  prompts: Prompts,
  answersMain: main.answersType,
  column?: ColumnDataset,
): Promise<answersType> => {
  if (answersMain.type === '2dsphere') {
    return { type: 'index', value: '2dsphere' };
  }

  if (specialTypeKeys.indexOf(answersMain.type) >= 0) {
    return { type: 'no' };
  }

  const questions = getQuestions(column);
  const answersSubType = await prompts.call<answersType>(questions);

  return answersSubType;
};

export const getQuestions = (column?: ColumnDataset): ReadonlyArray<any> => {
  const value = column && column.getIndexValue();
  const cType = column && column.getIndexType();

  const typeValue = cType ? Object.keys(schemaIndexTypes).indexOf(cType) : undefined;
  const typeValues = Object.entries(schemaIndexTypes).map<choiceListType<string>>(([k, v]) => ({
    name: v,
    value: k,
    short: v,
  }));

  const valueValue = value ? indexColumnValues.indexOf(value) : undefined;
  const valueValues = indexColumnValues;

  return [
    {
      type: 'list',
      name: 'type',
      message: 'Choose a index',
      choices: typeValues,
      default: typeValue,
    },
    {
      type: 'list',
      name: 'value',
      message: 'Choose a index type',
      choices: valueValues,
      default: valueValue,
      when: ({ type }: { type: schemaIndexType }) => typeof type === 'string' && type !== 'no',
    },
  ];
};

export const evaluation = (answers: answersType) => {
  return (column: ColumnDataset): ColumnDataset => {
    if (answers.type === 'no' || typeof answers.value === 'undefined') {
      column.removeIndex();
    } else {
      column.setIndex(answers.value, answers.type);
    }

    return column;
  };
};
