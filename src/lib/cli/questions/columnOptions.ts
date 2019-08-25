import { dataColumnType } from '../../types';

const onlyBoolean = ['required', 'lowercase', 'uppercase', 'trim'] as const;
const onlyString = ['match', 'enum', 'default'] as const;
const onlyNumber = ['minLength', 'maxLength', 'min', 'max'] as const;

/**
 *
 */
export type columnOptionsAnswersType = Pick<dataColumnType, Exclude<keyof dataColumnType, 'name' | 'type'>> & {
  options: string[];
};

/**
 *
 * @param column
 */
export const columnOptionsQuestions = (column: dataColumnType): ReadonlyArray<any> => {
  const choices = [
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
      message: `Default value for the column (e.g. Date.now or 'Hello World'):`,
      default: column.default,
      when: ({ options }: { options: string[] }) => options.indexOf('default') >= 0,
    },
  ];

  if (column.type === 'string') {
    questions.push(
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
        name: 'minLength',
        message: `Minimum number of characters:`,
        default: column.minLength,
        when: ({ options }: { options: string[] }) => options.indexOf('minLength') >= 0,
      },
      {
        type: 'number',
        name: 'maxLength',
        message: `Maximum number of characters:`,
        default: column.maxLength,
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

  if (column.type === 'number') {
    questions.push(
      {
        type: 'number',
        name: 'min',
        message: `Value must greater than or equal:`,
        default: column.min,
        when: ({ options }: { options: string[] }) => options.indexOf('min') >= 0,
      },
      {
        type: 'number',
        name: 'max',
        message: `Value must less than or equal:`,
        default: column.max,
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

/**
 *
 * @param column
 */
export const getColumnOptionsTypeAny = (column: dataColumnType) => {
  const withRequired = column.required === true;
  const withDefault = (column.default && column.default !== '') || typeof column.default === 'number';

  return [
    { name: 'required', short: 'required', value: 'required', checked: withRequired },
    { name: 'default', short: 'default', value: 'default', checked: withDefault },
  ];
};

/**
 *
 * @param column
 */
export const getColumnOptionsTypeString = (column: dataColumnType) => {
  if (column.type !== 'string') {
    return [];
  }

  const withTrim = column.trim === true;
  const withLowerCase = column.lowercase === true;
  const withUpperCase = column.uppercase === true;
  const withMatch = column.match && column.match !== '' ? true : false;
  const withEnum = column.enum && column.enum !== '' ? true : false;
  const withMinLength = column.minLength && Number.isInteger(column.minLength) ? true : false;
  const withMaxLength = column.maxLength && Number.isInteger(column.maxLength) ? true : false;

  return [
    { name: 'enum', short: 'enum', value: 'enum', checked: withEnum },
    { name: 'match (regexp)', short: 'match', value: 'match', checked: withMatch },
    { name: 'trim', short: 'trim', value: 'trim', checked: withTrim },
    { name: 'lowercase', short: 'lowercase', value: 'lowercase', checked: withLowerCase },
    { name: 'uppercase', short: 'uppercase', value: 'uppercase', checked: withUpperCase },
    { name: 'minLength', short: 'minLength', value: 'minLength', checked: withMinLength },
    { name: 'maxLength', short: 'maxLength', value: 'maxLength', checked: withMaxLength },
  ];
};

/**
 *
 * @param column
 */
export const getColumnOptionsTypeNumber = (column: dataColumnType) => {
  if (column.type !== 'number') {
    return [];
  }

  const withNumberMin = (column.min && Number.isInteger(column.min)) || column.min === 0;
  const withNumberax = (column.max && Number.isInteger(column.max)) || column.max === 0;

  return [
    { name: 'min', short: 'min', value: 'min', checked: withNumberMin },
    { name: 'max', short: 'max', value: 'max', checked: withNumberax },
  ];
};
