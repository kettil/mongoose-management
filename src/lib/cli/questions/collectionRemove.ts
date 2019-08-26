import { dataCollectionType } from '../../types';

/**
 *
 */
export type collectionRemoveAnswersType = { collections: string[]; isConfirm: boolean };

/**
 *
 * @param collections
 */
export const collectionRemoveQuestions = (collections: dataCollectionType[]): ReadonlyArray<any> => {
  return [
    {
      type: 'checkbox',
      name: 'collections',
      message: 'Which collections should be deleted?',
      choices: collections.map((c) => c.name),
      // Show only if at least two collections have been passed.
      when: collections.length > 1,
    },
    {
      type: 'confirm',
      name: 'isConfirm',
      message: 'Are the collection(s) really to be deleted?',
      default: false,

      // Show only if at least one collection is selected or only one collection is passed.
      when: ({ collections: names }: { collections: string[] }) =>
        (Array.isArray(names) && names.length > 0) || collections.length === 1,
    },
  ];
};
