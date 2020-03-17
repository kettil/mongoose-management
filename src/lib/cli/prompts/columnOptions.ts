import { schemaTypesSpecial } from '../../mongo';
import Prompts from '../../prompts';
import ColumnDataset, { optionsType } from '../dataset/column';
import * as main from './columnMain';

import { dataColumnType, OptionalValues } from '../../types';

const columnOpts = {
  required: 'boolean',
  default: 'any',
  lowercase: 'boolean',
  uppercase: 'boolean',
  trim: 'boolean',
  match: 'string',
  enum: 'string',
  minLength: 'number',
  maxLength: 'number',
  min: 'number',
  max: 'number',
};

export type answersType = OptionalValues<Pick<dataColumnType, optionsType>> & {
  options: optionsType[];
};

export type choiceOptionsType = {
  name: string;
  short: string;
  value: keyof answersType;
  checked: boolean | undefined;
};

export const call = async (
  prompts: Prompts,
  answersMain: main.answersType,
  column?: ColumnDataset,
): Promise<answersType> => {
  const questions = getQuestions(answersMain, column);

  if (questions.length === 0) {
    return { options: [] };
  }

  const answersOptions = await prompts.call<answersType>(questions);

  return answersOptions;
};

export const getQuestions = (answersMain: main.answersType, column?: ColumnDataset): ReadonlyArray<any> => {
  const choices: choiceOptionsType[] = [];
  const questions: any[] = [
    {
      type: 'checkbox',
      name: 'options',
      message: 'Choose the scheme options:',
      choices,
      validate: validateOptions,
    },
  ];

  [
    getColumnOptionsTypeAny(answersMain, column),
    getColumnOptionsTypeString(answersMain, column),
    getColumnOptionsTypeNumber(answersMain, column),
  ].forEach((data) => {
    choices.push(...data.choices);
    questions.push(...data.questions);
  });

  return choices.length === 0 ? [] : questions;
};

export const evaluation = (answers: answersType) => {
  return (column: ColumnDataset): ColumnDataset => {
    (Object.entries(columnOpts) as Array<[keyof typeof columnOpts, string]>).forEach(([key, type]) => {
      if (type === 'boolean') {
        column.set(key, answers.options.indexOf(key) >= 0 ? true : undefined);
      } else {
        column.set(key, answers[key]);
      }
    });

    return column;
  };
};

export const getColumnOptionsTypeAny = (
  answersMain: main.answersType,
  column?: ColumnDataset,
): { choices: choiceOptionsType[]; questions: any[] } => {
  const specialTypes = Object.keys(schemaTypesSpecial);
  const choices: choiceOptionsType[] = [];

  const withRequired = column && column.isset('required');
  const withDefault = column && column.isset('default');

  if (specialTypes.filter((t) => t !== '2dsphere').indexOf(answersMain.type) === -1) {
    choices.push({ name: 'required', short: 'required', value: 'required', checked: withRequired });
  }

  if (specialTypes.indexOf(answersMain.type) === -1) {
    choices.push({ name: 'default', short: 'default', value: 'default', checked: withDefault });
  }

  return {
    choices,
    questions: [
      {
        type: 'input',
        name: 'default',
        message: `Default value for the column (e.g. ${
          answersMain.type === 'uuidv4' ? 'uuidv4' : 'Date.now'
        } or "Hello World"):`,
        default: column && column.get('default'),
        when: whenCommon('default'),
      },
    ],
  };
};

export const getColumnOptionsTypeString = (
  answersMain: main.answersType,
  column?: ColumnDataset,
): { choices: choiceOptionsType[]; questions: any[] } => {
  if (answersMain.type !== 'string') {
    return { choices: [], questions: [] };
  }

  const withTrim = column && column.isset('trim');
  const withLowerCase = column && column.isset('lowercase');
  const withUpperCase = column && column.isset('uppercase');
  const withMatch = column && column.isset('match', false);
  const withEnum = column && column.isset('enum', false);
  const withMinLength = column && column.isset('minLength');
  const withMaxLength = column && column.isset('maxLength');

  return {
    choices: [
      { name: 'enum', short: 'enum', value: 'enum', checked: withEnum },
      { name: 'match (regexp)', short: 'match', value: 'match', checked: withMatch },
      { name: 'trim', short: 'trim', value: 'trim', checked: withTrim },
      { name: 'lowerCase', short: 'lowercase', value: 'lowercase', checked: withLowerCase },
      { name: 'upperCase', short: 'uppercase', value: 'uppercase', checked: withUpperCase },
      { name: 'minLength', short: 'minLength', value: 'minLength', checked: withMinLength },
      { name: 'maxLength', short: 'maxLength', value: 'maxLength', checked: withMaxLength },
    ],
    questions: [
      {
        type: 'input',
        name: 'enum',
        message: 'Allowed enum strings (semicolon [;] as separator):',
        default: column && column.get('enum'),
        when: whenCommon('enum'),
        filter: filterEnum,
      },
      {
        type: 'input',
        name: 'match',
        message: 'RegExp match value (e.g. ^[a-zA-Z0-9]+$ or [a-z]+):',
        default: column && column.get('match'),
        when: whenCommon('match'),
      },
      {
        type: 'number',
        name: 'minLength',
        message: 'Minimum number of characters:',
        default: column && column.get('minLength'),
        when: whenCommon('minLength'),
      },
      {
        type: 'number',
        name: 'maxLength',
        message: 'Maximum number of characters:',
        default: column && column.get('maxLength'),
        when: whenCommon('maxLength'),
        validate: validateMaxLength,
      },
    ],
  };
};

export const getColumnOptionsTypeNumber = (
  answersMain: main.answersType,
  column?: ColumnDataset,
): { choices: choiceOptionsType[]; questions: any[] } => {
  if (answersMain.type !== 'number') {
    return { choices: [], questions: [] };
  }

  const withNumberMin = column && column.isset('min');
  const withNumberax = column && column.isset('max');

  return {
    choices: [
      { name: 'min', short: 'min', value: 'min', checked: withNumberMin },
      { name: 'max', short: 'max', value: 'max', checked: withNumberax },
    ],
    questions: [
      {
        type: 'number',
        name: 'min',
        message: 'Value must greater than or equal:',
        default: column && column.get('min'),
        when: whenCommon('min'),
      },
      {
        type: 'number',
        name: 'max',
        message: 'Value must less than or equal:',
        default: column && column.get('max'),
        when: whenCommon('max'),
        validate: validateMax,
      },
    ],
  };
};

export const whenCommon = (type: keyof answersType) => ({ options }: { options: string[] }) =>
  options.indexOf(type) >= 0;

export const validateOptions = (v: string[]) => {
  if (v.indexOf('lowercase') >= 0 && v.indexOf('uppercase') >= 0) {
    return 'Either "lowercase" or "uppercase" can be selected!';
  }

  return true;
};

export const validateMaxLength = (v: string, { minLength }: { minLength?: string }) => {
  if (minLength && parseInt(minLength, 10) > parseInt(v, 10)) {
    return `Length must be greater or equal than to minimum length (>= ${minLength})!`;
  }

  return true;
};

export const validateMax = (v: string, { min }: { min?: string }) => {
  if (min && parseInt(min, 10) > parseInt(v, 10)) {
    return `Value must be greater or equal than to minimum value (>= ${min})!`;
  }

  return true;
};

export const filterEnum = (value: string) =>
  value
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s !== '')
    .join('; ');
