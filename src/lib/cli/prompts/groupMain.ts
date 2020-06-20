import { join } from 'path';

import Prompts, { regexpName, regexpNameMessage } from '../../prompts';
import { schemaType } from '../../types';
import GroupDataset, { idType, idTypes } from '../dataset/group';
import GroupsDataset from '../dataset/groups';
import { CancelPromptError } from '../errors';

export type answersType = { name: string; path: string; idType: schemaType; multipleConnection: boolean };

export const call = async (prompts: Prompts, groups: GroupsDataset, group?: GroupDataset): Promise<answersType> => {
  const questions = getQuestions(groups, group);
  const answersMain = await prompts.call<answersType>(questions);

  if (answersMain.name === '') {
    throw new CancelPromptError('cancel');
  }

  return answersMain;
};

export const getQuestions = (groups: GroupsDataset, group?: GroupDataset): ReadonlyArray<any> => {
  const nameValues = groups.getGroups().map((d) => d.getPath().toLowerCase());

  const idTypeValue = group ? group.getIdType() : idType;
  const idTypeValues = idTypes
    .filter(([key]) => key)
    .map(([key, value]) => ({
      name: value,
      value: key,
      short: value,
    }));

  return [
    {
      type: 'fuzzypath',
      name: 'path',
      message: 'Target path for the group:',
      when: !group,

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
      when: !group,

      validate: validateName(nameValues, groups.getPathProject()),
    },
    {
      type: 'list',
      name: 'idType',
      message: "Type of '_id' column:",
      choices: idTypeValues,
      default: idTypeValue,
    },
    {
      type: 'confirm',
      name: 'multipleConnection',
      message: 'Preparation for multiple connections (connection via "createConnection")',
      default: group ? group.withMultipleConnection() : false,
    },
  ];
};

export const evaluation = (answers: answersType, groups: GroupsDataset) => {
  return (group?: GroupDataset) => {
    if (!group) {
      const path = pathRelative(answers.name, answers.path, groups.getPathProject());

      return groups.addGroup(
        new GroupDataset(
          { path, collections: [], idType: answers.idType, multipleConnection: answers.multipleConnection },
          groups,
        ),
      );
    }

    group.setIdType(answers.idType);
    group.setMultipleConnection(answers.multipleConnection);

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
