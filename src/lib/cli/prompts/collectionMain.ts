import Prompts, { regexpName, regexpNameMessage } from '../../prompts';
import { schemaType } from '../../types';
import CollectionDataset from '../dataset/collection';
import GroupDataset, { idType, idTypes } from '../dataset/group';
import { CancelPromptError } from '../errors';

export type answersType = { name: string; idType?: schemaType };

export const call = async (
  prompts: Prompts,
  group: GroupDataset,
  collection?: CollectionDataset,
): Promise<answersType> => {
  const questions = getQuestions(group, collection);
  const answersMain = await prompts.call<answersType>(questions);

  if (answersMain.name === '') {
    throw new CancelPromptError('cancel');
  }

  return answersMain;
};

export const getQuestions = (group: GroupDataset, collection?: CollectionDataset): ReadonlyArray<any> => {
  const nameValue = collection ? collection.getName() : undefined;
  const nameValues = group
    .getCollections()
    .filter((d) => d !== collection)
    .map((d) => d.getName().toLowerCase());

  const idTypeGlobal = idTypes.reduce((type, [key, value]) => (group.getIdType() === key ? value : type), idType);
  const idTypeValue = collection ? collection.getIdType() : undefined;
  const idTypeValues = idTypes.map(([key, value]) => ({
    name: key === undefined ? `${value} (${idTypeGlobal})` : value,
    value: key,
    short: value,
  }));

  return [
    {
      type: 'input',
      name: 'name',
      default: nameValue,
      message: 'Collection name:',
      validate: validateName(nameValues),
    },
    {
      type: 'list',
      name: 'idType',
      message: "Type of '_id' column:",
      choices: idTypeValues,
      default: idTypeValue,
    },
  ];
};

export const evaluation = (answers: answersType, group: GroupDataset) => {
  return (collection?: CollectionDataset) => {
    if (!collection) {
      return group.addCollection(
        new CollectionDataset({ name: answers.name, idType: answers.idType, columns: [], indexes: [] }, group),
      );
    }

    collection.setName(answers.name);
    collection.setIdType(answers.idType);

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
