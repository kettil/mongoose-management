import { schemaTypesSpecial } from '../../mongo';

import { dataColumnType } from '../../types';

const onlyBoolean = ['required', 'lowercase', 'uppercase', 'trim'] as const;
const onlyString = ['match', 'enum', 'default'] as const;
const onlyNumber = ['minlength', 'maxlength', 'min', 'max'] as const;

/**
 *
 */
export type columnOptionsAnswersType = dataColumnType & { options: string[] };

/**
 *
 * @param column
 */
export const columnOptionsQuestions = (column: dataColumnType): ReadonlyArray<any> => {
  const choices = [];

  const withRequired = column.required === true;
  const withDefault = (column.default && column.default !== '') || typeof column.default === 'number';
  const withTrim = column.trim === true;
  const withLowerCase = column.lowercase === true;
  const withUpperCase = column.uppercase === true;
  const withMatch = column.match && column.match !== '';
  const withEnum = column.enum && column.enum !== '';
  const withMinLength = column.minlength && Number.isInteger(column.minlength);
  const withMaxLength = column.maxlength && Number.isInteger(column.maxlength);
  const withNumberMin = (column.min && Number.isInteger(column.min)) || column.min === 0;
  const withNumberax = (column.max && Number.isInteger(column.max)) || column.max === 0;

  if (Object.keys(schemaTypesSpecial).indexOf(column.type) === -1) {
    choices.push({ name: 'required', short: 'required', value: 'required', checked: withRequired });
    choices.push({ name: 'default', short: 'default', value: 'default', checked: withDefault });
  }

  if (column.type === 'string') {
    choices.push({ name: 'enum', short: 'enum', value: 'enum', checked: withEnum });
    choices.push({ name: 'match (regexp)', short: 'match', value: 'match', checked: withMatch });
    choices.push({ name: 'trim', short: 'trim', value: 'trim', checked: withTrim });
    choices.push({ name: 'lowercase', short: 'lowercase', value: 'lowercase', checked: withLowerCase });
    choices.push({ name: 'uppercase', short: 'uppercase', value: 'uppercase', checked: withUpperCase });
    choices.push({ name: 'minlength', short: 'minlength', value: 'minlength', checked: withMinLength });
    choices.push({ name: 'maxlength', short: 'maxlength', value: 'maxlength', checked: withMaxLength });
  }

  if (column.type === 'number') {
    choices.push({ name: 'min', short: 'min', value: 'minNumber', checked: withNumberMin });
    choices.push({ name: 'max', short: 'max', value: 'maxNumber', checked: withNumberax });
  }

  return [
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
      message: `Default value for the column (e.g. Date.now or 'Hello World'):`,
      default: column.default,
      when: ({ options }: { options: string[] }) => options.indexOf('default') >= 0,
    },

    // string
    {
      type: 'input',
      name: 'enum',
      message: `Allowed enum strings (semicolon [;] as separator):`,
      default: column.enum,
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
      message: `RegExp match value (e.g. ^[a-zA-Z0-9]+$ or [a-z]+):`,
      default: column.match,
      when: ({ options }: { options: string[] }) => options.indexOf('match') >= 0,
    },
    {
      type: 'number',
      name: 'minlength',
      message: `Minimum number of characters:`,
      default: column.minlength,
      when: ({ options }: { options: string[] }) => options.indexOf('minlength') >= 0,
    },
    {
      type: 'number',
      name: 'maxlength',
      message: `Maximum number of characters:`,
      default: column.maxlength,
      when: ({ options }: { options: string[] }) => options.indexOf('maxlength') >= 0,
      validate: (v: string, { minlength }: { minlength?: number }) => {
        if (minlength && minlength > parseInt(v, 10)) {
          return `Length must be greater or equal than to minimum length (>= ${minlength})!`;
        }

        return true;
      },
    },

    // number
    {
      type: 'number',
      name: 'min',
      message: `Value must greater than or equal:`,
      default: column.min,
      when: ({ options }: { options: string[] }) => options.indexOf('minNumber') >= 0,
    },
    {
      type: 'number',
      name: 'max',
      message: `Value must less than or equal:`,
      default: column.max,
      when: ({ options }: { options: string[] }) => options.indexOf('maxNumber') >= 0,
      validate: (v: string, { max }: { max?: number }) => {
        if (max && max > parseInt(v, 10)) {
          return `Value must be greater or equal than to minimum value (>= ${max})!`;
        }

        return true;
      },
    },
  ];
};

/**
 *
 * @param column
 * @param answers
 */
export const columnOptionsEvaluation = (column: dataColumnType, answers: columnOptionsAnswersType) => {
  onlyBoolean.forEach((v) => {
    if (answers.options.indexOf(v) >= 0) {
      column[v] = true;
    } else {
      delete column[v];
    }
  });

  onlyString.forEach((v) => {
    if (answers[v] && answers[v] !== '') {
      column[v] = answers[v];
    } else {
      delete answers[v];
    }
  });

  onlyNumber.forEach((v) => {
    if (answers[v] || answers[v] === 0) {
      column[v] = answers[v];
    } else {
      delete answers[v];
    }
  });
};
