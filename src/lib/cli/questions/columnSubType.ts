import { schemaTypesNormal } from '../../mongo';

import { choiceListType, dataColumnArrayType, dataColumnType, schemaNormalType } from '../../types';

/**
 *
 */
export type columnSubTypeAnswersType = { type: schemaNormalType };

/**
 *
 * @param column
 */
export const columnSubTypeQuestions = (column: dataColumnArrayType | dataColumnType): ReadonlyArray<any> => {
  const subType = column && column.subType;

  const typeValue = subType ? Object.keys(schemaTypesNormal).indexOf(subType.type) : undefined;
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

/**
 *
 * @param column
 * @param answers
 */
export const columnSubTypeEvaluation = (
  column: dataColumnArrayType | dataColumnType,
  answers: columnSubTypeAnswersType,
): dataColumnArrayType => {
  if (column.subType) {
    column.subType.type = answers.type;
  } else {
    column.subType = { type: answers.type };
  }

  return column.subType;
};
