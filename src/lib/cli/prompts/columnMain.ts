import { schemaTypes } from '../../mongo';
import Prompts, { regexpName, regexpNameMessage } from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';

import { choiceListType, schemaType } from '../../types';

const blacklist = ['id', '_id', 'createdAt', 'updatedAt'];

/**
 *
 */
export type answersType = { name: string; type: schemaType };

/**
 *
 * @param prompts
 * @param parent
 * @param column
 */
export const call = async (
  prompts: Prompts,
  parent: CollectionDataset | ColumnDataset,
  column?: ColumnDataset,
): Promise<answersType> => {
  const questions = getQuestions(parent, column);
  const answersMain = await prompts.call<answersType>(questions);

  if (answersMain.name === '') {
    throw new Error('cancel');
  }

  return answersMain;
};

/**
 *
 * @param parent
 * @param column
 */
export const getQuestions = (parent: CollectionDataset | ColumnDataset, column?: ColumnDataset): ReadonlyArray<any> => {
  const reservedColumnNames = parent instanceof CollectionDataset ? blacklist.map((v) => v.toLowerCase()) : [];
  const existedColumnName = parent.getColumns().map((d) => d.getName().toLowerCase());

  const nameValue = column ? column.getName() : undefined;

  const typeValue = column ? Object.keys(schemaTypes).indexOf(column.get('type')) : undefined;
  const typeValues = Object.entries(schemaTypes).map<choiceListType<string>>(([key, value]) => ({
    name: value.name,
    value: key,
    short: value.name,
  }));

  return [
    {
      type: 'input',
      name: 'name',
      message: 'Column name:',
      default: nameValue,

      validate: validateName(reservedColumnNames, existedColumnName, nameValue),
    },
    {
      type: 'list',
      name: 'type',
      message: 'Choose a SchemaType:',
      choices: typeValues,
      default: typeValue,

      when: whenType(),
    },
  ];
};

/**
 *
 * @param answers
 * @param collection
 */
export const evaluation = (
  answers: answersType,
  parent: CollectionDataset | ColumnDataset,
  collection: CollectionDataset,
) => {
  return (column?: ColumnDataset): ColumnDataset => {
    if (!column) {
      return parent.addColumn(new ColumnDataset({ name: answers.name, type: answers.type }, parent, collection));
    }

    column.setName(answers.name);
    column.set('type', answers.type);

    return column;
  };
};

/**
 *
 * @param reservedColumnNames
 * @param existedColumnName
 * @param nameValue
 */
export const validateName = (reservedColumnNames: string[], existedColumnName: string[], nameValue?: string) => (
  value: string,
) => {
  const name = value.trim();
  const lower = name.toLowerCase();

  if (reservedColumnNames.indexOf(lower) >= 0) {
    return 'This column is created automatically!';
  }

  if (existedColumnName.indexOf(lower) >= 0 && name !== nameValue) {
    return `A column with the name already exists!`;
  }

  if (!regexpName.test(name)) {
    return regexpNameMessage;
  }

  return true;
};

/**
 *
 */
export const whenType = () => ({ name }: { name: string }) => name.trim() !== '';
