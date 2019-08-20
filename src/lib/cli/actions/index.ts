import chalk from 'chalk';
import { Separator } from 'inquirer';
import { table } from 'table';

import { indexColumnValues, schemaTypesSpecial } from '../../mongo';
import { promptTableOptions, regexpName, regexpNameMessage } from '../../prompts';
import AbstractAction from './abstract';

import {
  choiceListType,
  choicesType,
  choiceValueSubType,
  dataColumnType,
  dataIndexColumnValueType,
  dataIndexType,
  schemaType,
} from '../../types';

const extendColumns: Array<[string, schemaType]> = [['createdAt', 'date'], ['updatedAt', 'date'], ['_id', 'objectId']];

const regexpColumnsChoices = new RegExp(`^\\\[*(${Object.keys(schemaTypesSpecial).join('|')})\\\]*$`, 'i');

/**
 *
 */
export default class IndexAction extends AbstractAction<dataIndexType, choiceValueSubType> {
  /**
   *
   * @param groups
   */
  getMenuItems(indexes: dataIndexType[]): Array<choicesType<choiceValueSubType>> {
    const title = chalk.underline(`Indexes list`);
    const header = ['Name', 'Column(s)', 'Unique', 'Sparse'];
    const values = indexes.map((value: dataIndexType) => [
      value.name,
      Object.entries(value.columns)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', '),
      (value.properties && value.properties.unique && '✔') || '',
      (value.properties && value.properties.sparse && '✔') || '',
    ]);

    const rows = table([header.map((s) => chalk.underline(s)), ...values], {
      ...promptTableOptions,
      columns: { 2: { alignment: 'center' }, 3: { alignment: 'center' } },
    }).split('\n');

    const choices: Array<choicesType<choiceValueSubType>> = indexes.map((d, i) => {
      if (d.readonly) {
        return new Separator(rows[i + 1]);
      }

      return {
        name: rows[i + 1],
        value: { value: { type: 'index', data: d } },
        short: `Index - ${d.name}`,
      };
    });

    if (choices.length === 0) {
      return [new Separator(title), new Separator(' '), new Separator(`- No indexes defined -`), new Separator(' ')];
    }

    return [new Separator(title), new Separator(' '), new Separator(rows[0]), ...choices, new Separator(' ')];
  }

  /**
   *
   */
  async create(indexes: dataIndexType[], columnList: dataColumnType[] = []): Promise<dataIndexType | false> {
    const columnsChoices = columnList
      .concat(extendColumns.map<dataColumnType>((c) => ({ name: c[0], type: c[1], required: false })))
      .map((d) => ({
        name: d.name,
        value: d.name,
        short: d.name,
        disabled: regexpColumnsChoices.test(d.type),
      }));

    const { name, columns } = await this.prompts.call<{ name: string; columns: string[] }>(
      this.questions(indexes.map((d) => d.name.toLowerCase()), columnsChoices),
    );

    if (name === '' || columns.length === 0) {
      return false;
    }

    const index: dataIndexType = {
      name,
      columns: {},
      properties: {},
    };

    // columns
    for (const column of columns) {
      const { indexType } = await this.prompts.call<{ indexType: dataIndexColumnValueType }>(
        this.questionsPerColumn(column),
      );
      index.columns[column] = indexType;
    }

    for (const value of indexes) {
      if (this.equalIndexColumns(index.columns, value.columns)) {
        const retry = await this.prompts.retry(
          `An index with the column configuration already exists! (duplicate index: "${value.name}")`,
        );

        if (retry) {
          const result = await this.create(indexes, columnList);

          return result;
        }

        return false;
      }
    }

    const { unique, sparse } = await this.prompts.call<{ unique: boolean; sparse: boolean }>(this.questionsPost());

    index.properties = {
      unique,
      sparse,
    };

    return index;
  }

  /**
   *
   * @param indexes
   * @param index
   */
  async edit(indexes: dataIndexType[], index: dataIndexType, columnList: dataColumnType[] = []): Promise<void> {
    const names = indexes.filter((d) => d.name !== index.name).map((d) => d.name.toLowerCase());
    const columnsKeys = Object.keys(index.columns);
    const columnsChoices = columnList
      .concat(extendColumns.map<dataColumnType>((c) => ({ name: c[0], type: c[1], required: false })))
      .map((d) => ({
        name: d.name,
        value: d.name,
        short: d.name,
        checked: columnsKeys.indexOf(d.name) >= 0 && !regexpColumnsChoices.test(d.type),
        disabled: regexpColumnsChoices.test(d.type) || d.name === '_id',
      }));

    const { name, columns } = await this.prompts.call<{ name: string; columns: string[] }>(
      this.questions(names, columnsChoices, index.name),
    );

    if (name === '' || columns.length === 0) {
      return;
    }

    // columns
    const indexColumns: dataIndexType['columns'] = {};
    for (const column of columns) {
      const { indexType } = await this.prompts.call<{ indexType: dataIndexColumnValueType }>(
        this.questionsPerColumn(column, index.columns[column]),
      );
      indexColumns[column] = indexType;
    }

    // test duplicate
    for (const value of indexes) {
      if (value !== index && this.equalIndexColumns(indexColumns, value.columns)) {
        const retry = await this.prompts.retry(
          `An index with the column configuration already exists! (duplicate index: "${value.name}")`,
        );

        if (retry) {
          const result = await this.edit(indexes, index, columnList);

          return result;
        }

        return;
      }
    }

    const { unique, sparse } = await this.prompts.call<{ unique: boolean; sparse: boolean }>(
      this.questionsPost({
        unique: index.properties.unique,
        sparse: index.properties.sparse,
      }),
    );

    index.name = name;
    index.columns = indexColumns;
    index.properties.unique = unique;
    index.properties.sparse = sparse;
  }

  /**
   *
   * @param items
   * @param defaultValue
   */
  questions(items: string[], columns: Array<choiceListType<string>>, defaultName?: string): ReadonlyArray<any> {
    return [
      {
        type: 'input',
        name: 'name',
        message: 'Index name:',
        default: defaultName,

        validate: (value: string) => {
          const column = value.trim();

          if (!regexpName.test(column)) {
            return regexpNameMessage;
          }

          if (items.indexOf(column.toLowerCase()) >= 0) {
            return `A index with the name already exists!`;
          }

          return true;
        },
      },
      {
        type: 'checkbox',
        name: 'columns',
        message: 'Choose a columns:',
        choices: columns,

        when: ({ name }: { name: string }) => name.trim() !== '',
      },
    ];
  }

  /**
   *
   * @param columnName
   */
  questionsPerColumn(columnName: string, defaultType?: string | number): ReadonlyArray<any> {
    return [
      {
        type: 'list',
        name: 'indexType',
        message: `Choose a index type for "${columnName}":`,
        choices: indexColumnValues,
        default: defaultType ? indexColumnValues.indexOf(defaultType) : undefined,
      },
    ];
  }

  /**
   *
   */
  questionsPost(defaults: { unique?: boolean; sparse?: boolean } = {}): ReadonlyArray<any> {
    return [
      {
        type: 'confirm',
        name: 'unique',
        message: 'Unique index?',
        default: defaults.unique === true,
      },
      {
        type: 'confirm',
        name: 'sparse',
        message: 'Sparse index?',
        default: defaults.sparse === true,
      },
    ];
  }

  /**
   *
   * @param a
   * @param b
   */
  sort(a: dataIndexType, b: dataIndexType) {
    const pathA = a.name.toLowerCase();
    const pathB = b.name.toLowerCase();

    if (pathA === pathB) {
      return 0;
    }

    return pathA < pathB ? -1 : 1;
  }

  /**
   *
   * @param a
   * @param b
   */
  equalIndexColumns(
    a: { [k: string]: dataIndexColumnValueType },
    b: { [k: string]: dataIndexColumnValueType },
  ): boolean {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      return false;
    }

    for (const key of aKeys) {
      if (a[key] !== b[key]) {
        return false;
      }
    }

    return true;
  }
}
