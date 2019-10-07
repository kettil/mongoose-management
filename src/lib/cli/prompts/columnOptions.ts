import Prompts from '../../prompts';
import ColumnDataset, { optionsType } from '../dataset/column';

import { dataColumnType } from '../../types';

const booleanValues: answersType['options'] = ['required', 'lowercase', 'uppercase', 'trim'];

/**
 *
 */
export type answersType = Pick<dataColumnType, optionsType> & {
  options: optionsType[];
};

/**
 *
 */
export type choiceOptionsType = {
  name: string;
  short: string;
  value: optionsType;
  checked: boolean | undefined;
};

/**
 *
 * @param prompts
 * @param column
 */
export const call = async (prompts: Prompts, column?: ColumnDataset): Promise<answersType> => {
  const questions = getQuestions(column);
  const answersMain = await prompts.call<answersType>(questions);

  return answersMain;
};

/**
 *
 * @param column
 */
export const getQuestions = (column?: ColumnDataset): ReadonlyArray<any> => {
  const choices: choiceOptionsType[] = [
    ...getColumnOptionsTypeAny(column),
    ...getColumnOptionsTypeString(column),
    ...getColumnOptionsTypeNumber(column),
  ];

  // create questions
  const questions: any[] = [
    {
      type: 'checkbox',
      name: 'options',
      message: 'Choose the scheme options:',
      choices,
      validate: (v: string[]) => {
        if (v.indexOf('lowercase') >= 0 && v.indexOf('uppercase') >= 0) {
          return 'Either "lowercase" or "uppercase" can be selected!';
        }

        return true;
      },
    },
    {
      type: 'input',
      name: 'default',
      message: 'Default value for the column (e.g. Date.now or "Hello World"):',
      default: column && column.get('default'),
      when: ({ options }: { options: string[] }) => options.indexOf('default') >= 0,
    },
  ];

  if (column && column.get('type') === 'string') {
    questions.push(
      {
        type: 'input',
        name: 'enum',
        message: 'Allowed enum strings (semicolon [;] as separator):',
        default: column.get('enum'),
        when: ({ options }: { options: string[] }) => options.indexOf('enum') >= 0,
        filter: (value: string) =>
          value
            .split(';')
            .map((s) => s.trim())
            .filter((s) => s !== '')
            .join('; '),
      },
      {
        type: 'input',
        name: 'match',
        message: 'RegExp match value (e.g. ^[a-zA-Z0-9]+$ or [a-z]+):',
        default: column.get('match'),
        when: ({ options }: { options: string[] }) => options.indexOf('match') >= 0,
      },
      {
        type: 'number',
        name: 'minLength',
        message: 'Minimum number of characters:',
        default: column.get('minLength'),
        when: ({ options }: { options: string[] }) => options.indexOf('minLength') >= 0,
      },
      {
        type: 'number',
        name: 'maxLength',
        message: 'Maximum number of characters:',
        default: column.get('maxLength'),
        when: ({ options }: { options: string[] }) => options.indexOf('maxLength') >= 0,
        validate: (v: string, { minLength }: { minLength?: number }) => {
          if (minLength && minLength > parseInt(v, 10)) {
            return `Length must be greater or equal than to minimum length (>= ${minLength})!`;
          }

          return true;
        },
      },
    );
  }

  if (column && column.get('type') === 'number') {
    questions.push(
      {
        type: 'number',
        name: 'min',
        message: 'Value must greater than or equal:',
        default: column.get('min'),
        when: ({ options }: { options: string[] }) => options.indexOf('min') >= 0,
      },
      {
        type: 'number',
        name: 'max',
        message: 'Value must less than or equal:',
        default: column.get('max'),
        when: ({ options }: { options: string[] }) => options.indexOf('max') >= 0,
        validate: (v: string, { min }: { min?: number }) => {
          if (min && min > parseInt(v, 10)) {
            return `Value must be greater or equal than to minimum value (>= ${min})!`;
          }

          return true;
        },
      },
    );
  }

  return questions;
};

/**
 *
 * @param answers
 */
export const evaluation = (answers: answersType) => {
  return (column: ColumnDataset): ColumnDataset => {
    answers.options
      .filter((key) => booleanValues.indexOf(key) === -1)
      .forEach((key) => {
        column.set(key, answers[key]);
      });

    booleanValues.forEach((key) => {
      column.set(key, answers.options.indexOf(key) >= 0 ? true : undefined);
    });

    return column;
  };
};

/**
 *
 * @param column
 */
export const getColumnOptionsTypeAny = (column?: ColumnDataset): choiceOptionsType[] => {
  const withRequired = column && column.isset('required');
  const withDefault = column && column.isset('default');

  return [
    { name: 'required', short: 'required', value: 'required', checked: withRequired },
    { name: 'default', short: 'default', value: 'default', checked: withDefault },
  ];
};

/**
 *
 * @param column
 */
export const getColumnOptionsTypeString = (column?: ColumnDataset): choiceOptionsType[] => {
  if (!column || column.get('type') !== 'string') {
    return [];
  }

  const withTrim = column.isset('trim');
  const withLowerCase = column.isset('lowercase');
  const withUpperCase = column.isset('uppercase');
  const withMatch = column.isset('match', false);
  const withEnum = column.isset('enum', false);
  const withMinLength = column.isset('minLength');
  const withMaxLength = column.isset('maxLength');

  return [
    { name: 'enum', short: 'enum', value: 'enum', checked: withEnum },
    { name: 'match (regexp)', short: 'match', value: 'match', checked: withMatch },
    { name: 'trim', short: 'trim', value: 'trim', checked: withTrim },
    { name: 'lowerCase', short: 'lowercase', value: 'lowercase', checked: withLowerCase },
    { name: 'upperCase', short: 'uppercase', value: 'uppercase', checked: withUpperCase },
    { name: 'minLength', short: 'minLength', value: 'minLength', checked: withMinLength },
    { name: 'maxLength', short: 'maxLength', value: 'maxLength', checked: withMaxLength },
  ];
};

/**
 *
 * @param column
 */
export const getColumnOptionsTypeNumber = (column?: ColumnDataset): choiceOptionsType[] => {
  if (!column || column.get('type') !== 'number') {
    return [];
  }

  const withNumberMin = column.isset('min');
  const withNumberax = column.isset('max');

  return [
    { name: 'min', short: 'min', value: 'min', checked: withNumberMin },
    { name: 'max', short: 'max', value: 'max', checked: withNumberax },
  ];
};
