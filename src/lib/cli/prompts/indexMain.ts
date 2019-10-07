import { schemaTypesSpecial } from '../../mongo';
import Prompts, { regexpName, regexpNameMessage } from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import IndexDataset from '../dataset/index';

export type answersType = { name: string; columns: ColumnDataset[] };

export const call = async (
  prompts: Prompts,
  collection: CollectionDataset,
  index?: IndexDataset,
): Promise<answersType> => {
  const questions = getQuestions(collection, index);
  const answersMain = await prompts.call<answersType>(questions);

  if (answersMain.name === '' || answersMain.columns.length === 0) {
    throw new Error('cancel');
  }

  return answersMain;
};

export const getQuestions = (collection: CollectionDataset, index?: IndexDataset): ReadonlyArray<any> => {
  const indexes = collection.getIndexes();

  const nameValue = index && index.getName();
  const nameValues = indexes.filter((d) => d !== index).map((d) => d.getName().toLowerCase());

  const columnNames = index ? index.getColumns().map(([column]) => column.getFullname(false, false)) : [];
  const columnValues = collection.flatColumns().map((column) => getChoiceItem(column, columnNames));

  return [
    {
      type: 'input',
      name: 'name',
      message: 'Index name:',
      default: nameValue,

      validate: validateName(nameValues),
    },
    {
      type: 'checkbox',
      name: 'columns',
      message: 'Choose a columns:',
      choices: columnValues,

      when: whenColumns(),
    },
  ];
};

export const evaluation = (answers: answersType, collection: CollectionDataset) => {
  return (index?: IndexDataset): IndexDataset => {
    if (!index) {
      const data = { name: answers.name, columns: {}, properties: {} };

      return collection.addIndex(new IndexDataset(data, collection));
    }

    index.setName(answers.name);

    return index;
  };
};

export const getChoiceItem = (column: ColumnDataset, columns: string[]) => {
  const name = column.getFullname(false, false);
  const disabled = Object.keys(schemaTypesSpecial).indexOf(column.get('type')) >= 0;
  const checked = !disabled && columns.length > 0 && columns.indexOf(name) >= 0;

  return {
    name,
    value: column,
    short: name,
    checked,
    disabled,
  };
};

export const validateName = (nameValues: string[]) => (value: string) => {
  const name = value.trim();

  if (!regexpName.test(name)) {
    return regexpNameMessage;
  }

  if (nameValues.indexOf(name.toLowerCase()) >= 0) {
    return 'A index with the name already exists!';
  }

  return true;
};

export const whenColumns = () => ({ name }: { name: string }) => name.trim() !== '';
