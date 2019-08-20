import { regexpName, regexpNameMessage } from '../../prompts';

import { dataCollectionType } from '../../types';

/**
 *
 */
export type collectionMainAnswersType = { name: string };

/**
 *
 * @param column
 */
export const collectionMainQuestions = (
  collection: dataCollectionType | undefined,
  collections: dataCollectionType[],
): ReadonlyArray<any> => {
  const nameValue = collection ? collection.name : undefined;
  const nameValues = collections
    .filter((d) => !collection || d.name !== collection.name)
    .map((d) => d.name.toLowerCase());

  return [
    {
      type: 'input',
      name: 'name',
      default: nameValue,
      message: 'Collection name:',

      validate: (value: string) => {
        const item = value.trim();

        if (!regexpName.test(item)) {
          return regexpNameMessage;
        }

        if (nameValues.indexOf(item.toLowerCase()) >= 0) {
          return `A collection with the name already exists!`;
        }

        return true;
      },
    },
  ];
};

/**
 *
 * @param column
 * @param answers
 */
export const collectionMainEvaluation = (
  collection: dataCollectionType | undefined,
  answers: collectionMainAnswersType,
): dataCollectionType => {
  if (!collection) {
    return { name: answers.name, columns: [], indexes: [] };
  }

  collection.name = answers.name;

  return collection;
};
