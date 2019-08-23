import { schemaTypes } from '../../mongo';
import { regexpName, regexpNameMessage } from '../../prompts';

import { choiceListType, dataColumnType, schemaType } from '../../types';

/**
 *
 */
export type columnMainAnswersType = { name: string; type: schemaType };

/**
 *
 * @param column
 */
export const columnMainQuestions = (
  column?: dataColumnType,
  names: readonly string[] = [],
  blacklist: readonly string[] = [],
): ReadonlyArray<any> => {
  const reservedColumns = blacklist.map((v) => v.toLowerCase());

  const typeValue = column ? Object.keys(schemaTypes).indexOf(column.type) : undefined;
  const typeValues = Object.entries(schemaTypes).map<choiceListType<string>>(([key, value]) => ({
    name: value.name,
    value: key,
    short: value.name,
  }));

  return [
    {
      type: 'input',
      name: 'name',
      message: 'Column name:',
      default: column ? column.name : undefined,

      validate: (value: string) => {
        const name = value.trim();

        if (reservedColumns.indexOf(name.toLowerCase()) >= 0) {
          return 'This column is created automatically!';
        }

        if (!regexpName.test(name)) {
          return regexpNameMessage;
        }

        if (names.indexOf(name.toLowerCase()) >= 0) {
          return `A column with the name already exists!`;
        }

        return true;
      },
    },
    {
      type: 'list',
      name: 'type',
      message: 'Choose a SchemaType:',
      choices: typeValues,
      default: typeValue,

      when: ({ name }: { name: string }) => name.trim() !== '',
    },
  ];
};

/**
 *
 * @param column
 * @param answers
 */
export const columnMainEvaluation = (
  column: dataColumnType | undefined,
  answers: columnMainAnswersType,
): dataColumnType => {
  if (!column) {
    return { name: answers.name, type: answers.type };
  }

  column.name = answers.name;
  column.type = answers.type;

  return column;
};
