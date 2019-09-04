import Prompts from '../../prompts';
import IndexDataset from '../dataset/index';

/**
 *
 */
export type answersType = { unique: boolean; sparse: boolean };

/**
 *
 * @param prompts
 * @param answersMain
 * @param index
 */
export const call = async (prompts: Prompts, index?: IndexDataset): Promise<answersType> => {
  const questions = getQuestions(index);
  const answersColumns = await prompts.call<answersType>(questions);

  return answersColumns;
};

/**
 *
 * @param index
 */
export const getQuestions = (index?: IndexDataset): ReadonlyArray<any> => {
  return [
    {
      type: 'confirm',
      name: 'unique',
      message: 'Unique index?',
      default: index && index.getProperty('unique') === true,
    },
    {
      type: 'confirm',
      name: 'sparse',
      message: 'Sparse index?',
      default: index && index.getProperty('sparse') === true,
    },
  ];
};

/**
 *
 * @param answers
 */
export const evaluation = (answers: answersType) => {
  return (index: IndexDataset): IndexDataset => {
    index.setProperty('unique', answers.unique || undefined);
    index.setProperty('sparse', answers.sparse || undefined);

    return index;
  };
};
