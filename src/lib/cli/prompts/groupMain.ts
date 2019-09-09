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
 * @param groups
 */
export const call = async (prompts: Prompts, groups: GroupsDataset): Promise<answersType> => {
  const questions = getQuestions(groups);
  const answersMain = await prompts.call<answersType>(questions);

  if (answersMain.name === '') {
    throw new Error('cancel');
  }

  return answersMain;
};

/**
 *
 * @param groups
 */
export const getQuestions = (groups: GroupsDataset): ReadonlyArray<any> => {
  const nameValues = groups.getGroups().map((d) => d.getPath().toLowerCase());

  return [
    {
      type: 'fuzzypath',
      name: 'path',
      message: 'Target path for the group:',

      excludePath,
      itemType: 'directory',
      suggestOnly: false,
      rootPath: groups.getPathProject(),
    },
    {
      type: 'input',
      name: 'name',
      default: 'odm',
      message: 'Collection group name:',

      validate: validateName(nameValues, groups.getPathProject()),
    },
  ];
};

/**
 *
 * @param answers
 * @param groups
 */
export const evaluation = (answers: answersType, groups: GroupsDataset) => {
  return (group?: GroupDataset) => {
    const path = join(answers.path.replace(groups.getPathProject() + '/', ''), answers.name);

    if (!group) {
      return groups.addGroup(new GroupDataset({ path, collections: [] }, groups));
    }

    group.setPath(path);

    return group;
  };
};

/**
 *
 * @param nameValues
 */
export const validateName = (nameValues: string[], pathProject: string) => (
  value: string,
  { path }: { path: string },
) => {
  const name = value.trim();
  const mergedPath = join(path.replace(pathProject + '/', ''), name);

  if (!regexpName.test(name)) {
    return regexpNameMessage;
  }

  if (nameValues.indexOf(mergedPath.toLowerCase()) >= 0) {
    return `The path and the name already exist as a group [group: ${mergedPath}]!`;
  }

  return true;
};

/**
 *
 * @param path
 */
export const excludePath = (path: string) => /node_modules|\/\.|\\\.|^\../.test(path);
