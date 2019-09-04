import { join } from 'path';

import Prompts, { regexpName, regexpNameMessage } from '../../prompts';

import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';

/**
 *
 */
export type answersType = { name: string; path: string };

/**
 *
 * @param prompts
 * @param data
 */
export const call = async (prompts: Prompts, data: GroupsDataset): Promise<answersType> => {
  const questions = getQuestions(data);
  const answersMain = await prompts.call<answersType>(questions);

  if (answersMain.name === '') {
    throw new Error('cancel');
  }

  return answersMain;
};

/**
 *
 * @param data
 */
export const getQuestions = (data: GroupsDataset): ReadonlyArray<any> => {
  const nameValues = data.getGroups().map((d) => d.getPath().toLowerCase());

  return [
    {
      type: 'fuzzypath',
      name: 'path',
      message: 'Target path for the group:',

      excludePath: (path: string) => /node_modules|\/\.|\\\.|^\../.test(path),
      itemType: 'directory',
      suggestOnly: false,
      rootPath: data.getPathProject(),
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
 * @param answers
 * @param data
 */
export const evaluation = (answers: answersType, data: GroupsDataset) => {
  return (group?: GroupDataset) => {
    const path = join(answers.path.replace(data.getPathProject() + '/', ''), answers.name);

    if (!group) {
      return data.addGroup(new GroupDataset({ path, collections: [] }, data));
    }

    group.setPath(path);

    return group;
  };
};
