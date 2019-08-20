import { join } from 'path';

import { regexpName, regexpNameMessage } from '../../prompts';

import { dataGroupType } from '../../types';

/**
 *
 */
export type groupMainAnswersType = { name: string; path: string };

/**
 *
 * @param groups
 */
export const groupMainQuestions = (groups: dataGroupType[]): ReadonlyArray<any> => {
  const nameValues = groups.map((d) => d.path.toLowerCase());

  return [
    {
      type: 'fuzzypath',
      name: 'path',
      message: 'Target path for the group:',

      excludePath: (path: string) => /node_modules|\/\.|\\\.|^\../.test(path),
      itemType: 'directory',
      rootPath: '.',
      suggestOnly: false,
    },
    {
      type: 'input',
      name: 'name',
      default: 'odm',
      message: 'Collection group name:',

      validate: (value: string, { path }: { path: string }) => {
        const name = value.trim();
        const mergedPath = join(path, name);

        if (!regexpName.test(name)) {
          return regexpNameMessage;
        }

        if (nameValues.indexOf(mergedPath.toLowerCase()) >= 0) {
          return `The path and the name already exist as a group [group: ${mergedPath}]!`;
        }

        return true;
      },
    },
  ];
};

/**
 *
 * @param group
 * @param answers
 */
export const groupMainEvaluation = (group: dataGroupType | undefined, answers: groupMainAnswersType): dataGroupType => {
  if (!group) {
    return { path: join(answers.path, answers.name), collections: [] };
  }

  group.path = join(answers.path, answers.name);

  return group;
};
