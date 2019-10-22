import Prompts, { regexpName, regexpNameMessage } from '../../prompts';

import CollectionDataset from '../dataset/collection';
import GroupDataset from '../dataset/group';

export type answersType = { name: string };

export const call = async (
  prompts: Prompts,
  group: GroupDataset,
  collection?: CollectionDataset,
): Promise<answersType> => {
  const questions = getQuestions(group, collection);
  const answersMain = await prompts.call<answersType>(questions);

  if (answersMain.name === '') {
    throw new Error('cancel');
  }

  return answersMain;
};

export const getQuestions = (group: GroupDataset, collection?: CollectionDataset): ReadonlyArray<any> => {
  const nameValue = collection ? collection.getName() : undefined;
  const nameValues = group
    .getCollections()
    .filter((d) => d !== collection)
    .map((d) => d.getName().toLowerCase());

  return [
    {
      type: 'input',
      name: 'name',
      default: nameValue,
      message: 'Collection name:',
      validate: validateName(nameValues),
    },
  ];
};

export const evaluation = (answers: answersType, group: GroupDataset) => {
  return (collection?: CollectionDataset) => {
    if (!collection) {
      return group.addCollection(new CollectionDataset({ name: answers.name, columns: [], indexes: [] }, group));
    }

    collection.setName(answers.name);

    return collection;
  };
};

export const validateName = (nameValues: string[]) => (value: string) => {
  const name = value.trim();

  if (!regexpName.test(name)) {
    return regexpNameMessage;
  }

  if (nameValues.indexOf(name.toLowerCase()) >= 0) {
    return 'A collection with the name already exists!';
  }

  return true;
};
