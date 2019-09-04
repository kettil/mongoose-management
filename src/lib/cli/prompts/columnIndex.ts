import { indexColumnValues, schemaIndexTypes, schemaTypesSpecial } from '../../mongo';
import Prompts from '../../prompts';

import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import IndexDataset from '../dataset/index';

import * as main from './columnMain';

import { choiceListType, dataIndexColumnValueType, dataIndexType, schemaIndexType } from '../../types';

const specialTypeKeys = Object.keys(schemaTypesSpecial);

/**
 *
 */
export type answersType = { type: keyof typeof schemaIndexTypes; value?: dataIndexColumnValueType };

/**
 *
 * @param prompts
 * @param answersMain
 * @param column
 */
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

/**
 *
 * @param column
 */
export const getQuestions = (column?: ColumnDataset): ReadonlyArray<any> => {
  const index = column && column.getIndex();
  const value = index && index.getColumnValue();
  const cType = index && index.getColumnType();

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

/**
 *
 * @param answers
 * @param collection
 */
export const evaluation = (answers: answersType, collection: CollectionDataset) => {
  return (column: ColumnDataset): ColumnDataset => {
    let index = column.getIndex();

    if (answers.type === 'no' || typeof answers.value === 'undefined') {
      if (index) {
        index.remove();
      }

      return column;
    }

    const name = column.getIndexName();
    const columns: dataIndexType['columns'] = { [column.getFullname(false, false)]: answers.value };

    if (!index) {
      index = collection.addIndex(new IndexDataset({ name, columns, properties: {}, readonly: true }, collection));
    } else {
      index.setName(name);
      index.setColumns(columns);
    }

    index.setProperty('unique', answers.type === 'unique');
    index.setProperty('sparse', answers.type === 'sparse');

    return column;
  };
};
