import { dataIndexType } from '../../types';

/**
 *
 */
export type indexOptionsAnswersType = { unique: boolean; sparse: boolean };

/**
 *
 * @param index
 * @param indexes
 * @param column
 */
export const indexOptionsQuestions = (index: dataIndexType | undefined): ReadonlyArray<any> => {
  return [
    {
      type: 'confirm',
      name: 'unique',
      message: 'Unique index?',
      default: index && index.properties.unique === true,
    },
    {
      type: 'confirm',
      name: 'sparse',
      message: 'Sparse index?',
      default: index && index.properties.sparse === true,
    },
  ];
};

/**
 *
 * @param index
 * @param answers
 */
export const indexOptionsEvaluation = (index: dataIndexType, answers: indexOptionsAnswersType) => {
  index.properties = answers;
};
