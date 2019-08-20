import { indexColumnValues, schemaIndexTypes, schemaTypesSpecial } from '../../mongo';

import { choiceListType, dataColumnType, dataIndexColumnValueType, dataIndexType, schemaIndexType } from '../../types';

/**
 *
 */
export type columnIndexAnswersType = { mode: keyof typeof schemaIndexTypes; type: dataIndexColumnValueType };

/**
 *
 * @param index
 */
export const columnIndexQuestions = (index?: dataIndexType): ReadonlyArray<any> => {
  const modeValue = index && index.mode ? Object.keys(schemaIndexTypes).indexOf(index.mode) : undefined;
  const modeValues = Object.entries(schemaIndexTypes).map<choiceListType<string>>(([key, value]) => ({
    name: value,
    value: key,
    short: value,
  }));

  const typeValue = index && index.type ? indexColumnValues.indexOf(index.type) : undefined;
  const typeValues = indexColumnValues;

  return [
    {
      type: 'list',
      name: 'mode',
      message: 'Choose a index',
      choices: modeValues,
      default: modeValue,
    },
    {
      type: 'list',
      name: 'type',
      message: 'Choose a index type',
      choices: typeValues,
      default: typeValue,
      when: ({ mode }: { mode: schemaIndexType }) => typeof mode === 'string' && mode !== 'no',
    },
  ];
};

/**
 *
 * @param column
 * @param answers
 * @param indexes
 * @param index
 * @param prefixName
 */
export const columnIndexEvaluation = (
  column: dataColumnType,
  answers: columnIndexAnswersType,
  indexes: dataIndexType[],
  index?: dataIndexType,
  prefixName: string = '',
) => {
  if (answers.mode === 'no') {
    // remove index, if exists
    if (index) {
      delete indexes[indexes.indexOf(index)];
    }
    return;
  }

  if (
    Object.keys(schemaTypesSpecial).indexOf(column.type) === -1 &&
    typeof schemaIndexTypes[answers.mode] === 'string'
  ) {
    // create or update index
    const columnIndex: { [k: string]: dataIndexColumnValueType } = { [prefixName + column.name]: answers.type };

    if (index) {
      // update
      index.name = getIndexName(column.name, answers.mode, prefixName);
      index.columns = columnIndex;
      index.properties = getIndexProperties(answers.mode);
      index.mode = answers.mode;
      index.type = answers.type;
    } else {
      // create
      indexes.push({
        name: getIndexName(column.name, answers.mode, prefixName),
        columns: columnIndex,
        properties: getIndexProperties(answers.mode),
        readonly: true,
        mode: answers.mode,
        type: answers.type,
      });
    }
  }
};

/**
 *
 * @param name
 * @param mode
 * @param prefix
 */
export const getIndexName = (name: string, mode: string, prefix: string): string => {
  return `${prefix}${name}-${mode}_`;
};

/**
 *
 * @param mode
 */
export const getIndexProperties = (mode: schemaIndexType): dataIndexType['properties'] => {
  switch (mode) {
    case 'sparse':
      return { sparse: true };
      break;
    case 'unique':
      return { unique: true };
      break;
    default:
      return {};
  }
};
