import { schemaTypesSpecial } from '../../mongo';
import { regexpName, regexpNameMessage } from '../../prompts';

import { dataColumnType, dataIndexType, schemaType } from '../../types';

const extendColumns: Array<[string, schemaType]> = [['createdAt', 'date'], ['updatedAt', 'date'], ['_id', 'objectId']];

const regexpColumnsChoices = new RegExp(`^\\\[*(${Object.keys(schemaTypesSpecial).join('|')})\\\]*$`, 'i');

/**
 *
 */
export type indexMainAnswersType = { name: string; columns: string[] };

/**
 *
 * @param index
 * @param indexes
 * @param column
 */
export const indexMainQuestions = (
  index: dataIndexType | undefined,
  indexes: dataIndexType[],
  columns: dataColumnType[],
): ReadonlyArray<any> => {
  const nameValue = index ? index.name : undefined;
  const nameValues = indexes.filter((d) => !index || d.name !== index.name).map((d) => d.name.toLowerCase());

  const columnNames = index ? Object.keys(index.columns) : [];

  const columnValues = columns
    .concat(extendColumns.map<dataColumnType>((c) => ({ name: c[0], type: c[1], required: false })))
    .map((d) => ({
      name: d.name,
      value: d.name,
      short: d.name,
      checked: columnNames.length > 0 && columnNames.indexOf(d.name) >= 0 && !regexpColumnsChoices.test(d.type),
      disabled: regexpColumnsChoices.test(d.type),
    }));

  return [
    {
      type: 'input',
      name: 'name',
      message: 'Index name:',
      default: nameValue,

      validate: (value: string) => {
        const name = value.trim();

        if (!regexpName.test(name)) {
          return regexpNameMessage;
        }

        if (nameValues.indexOf(name.toLowerCase()) >= 0) {
          return `A index with the name already exists!`;
        }

        return true;
      },
    },
    {
      type: 'checkbox',
      name: 'columns',
      message: 'Choose a columns:',
      choices: columnValues,

      when: ({ name }: { name: string }) => name.trim() !== '',
    },
  ];
};

/**
 *
 * @param index
 * @param answers
 */
export const indexMainEvaluation = (index: dataIndexType | undefined, answers: indexMainAnswersType): dataIndexType => {
  if (!index) {
    return {
      name: answers.name,
      columns: {},
      properties: {},
    };
  }

  index.name = answers.name;

  return index;
};
