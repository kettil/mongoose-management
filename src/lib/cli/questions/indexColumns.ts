import { indexColumnValues } from '../../mongo';

import { dataIndexColumnValueType, dataIndexType } from '../../types';

/**
 *
 */
export type indexColumnsAnswersType = { [K: string]: dataIndexColumnValueType };

/**
 *
 * @param index
 * @param columnsName
 */
export const indexColumnsQuestions = (index: dataIndexType, columnsName: string[]): ReadonlyArray<any> => {
  return columnsName.map((name) => ({
    type: 'list',
    name,
    message: `Choose a index type for "${name}":`,
    choices: indexColumnValues,
    default: index.columns[name] ? indexColumnValues.indexOf(index.columns[name]) : undefined,
  }));
};

/**
 *
 * @param index
 * @param answers
 * @param indexes
 */
export const indexColumnsEvaluation = (
  index: dataIndexType,
  answers: indexColumnsAnswersType,
  indexes: dataIndexType[],
) => {
  // test duplicate
  for (const value of indexes) {
    if (value !== index && equalIndexColumns(answers, value.columns)) {
      // tslint:disable-next-line
      throw new Error(`An index with the column configuration already exists! (duplicate index: "${value.name}")`);
    }
  }

  index.columns = answers;
};

/**
 *
 * @param a
 * @param b
 */
export const equalIndexColumns = (
  a: { [k: string]: dataIndexColumnValueType },
  b: { [k: string]: dataIndexColumnValueType },
): boolean => {
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
