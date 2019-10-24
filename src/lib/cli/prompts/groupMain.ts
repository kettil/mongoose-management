import { join } from 'path';

import Prompts, { regexpName, regexpNameMessage } from '../../prompts';
import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';
import { CancelPromptError } from '../errors';

export type answersType = { name: string; path: string };

export const call = async (prompts: Prompts, groups: GroupsDataset): Promise<answersType> => {
  const questions = getQuestions(groups);
  const answersMain = await prompts.call<answersType>(questions);

  if (answersMain.name === '') {
    throw new CancelPromptError('cancel');
  }

  return answersMain;
};

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

export const evaluation = (answers: answersType, groups: GroupsDataset) => {
  return (group?: GroupDataset) => {
    const path = pathRelative(answers.name, answers.path, groups.getPathProject());

    if (!group) {
      return groups.addGroup(new GroupDataset({ path, collections: [] }, groups));
    }

    group.setPath(path);

    return group;
  };
};

export const validateName = (nameValues: string[], pathProject: string) => (
  value: string,
  { path }: { path: string },
) => {
  const name = value.trim();
  const mergedPath = pathRelative(name, path, pathProject);

  if (!regexpName.test(name)) {
    return regexpNameMessage;
  }

  if (nameValues.indexOf(mergedPath.toLowerCase()) >= 0) {
    return `The path and the name already exist as a group [group: ${mergedPath}]!`;
  }

  return true;
};

export const pathRelative = (name: string, pathDocuments: string, pathProject: string) => {
  const path = pathDocuments.replace(pathProject, '');

  return join(path.substr(0, 1) === '/' ? path.substr(1) : path, name);
};

export const excludePath = (path: string) => /node_modules|\/\.|\\\.|^\../.test(path);
