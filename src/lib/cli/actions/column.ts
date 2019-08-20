import chalk from 'chalk';
import { Separator } from 'inquirer';
import { table } from 'table';

import { schemaTypesSpecial } from '../../mongo';
import Prompts, { promptTableOptions } from '../../prompts';
import * as questions from '../questions';
import AbstractAction from './abstract';
import Index from './index';

import {
  choicesType,
  choiceValueSubType,
  dataColumnArrayType,
  dataColumnGroupType,
  dataColumnType,
  dataIndexType,
} from '../../types';

const blacklist = ['id', '_id', 'createdAt', 'updatedAt'];

/**
 *
 */
export default class ColumnAction extends AbstractAction<dataColumnType, choiceValueSubType> {
  /**
   *
   * @param prompts
   * @param index
   */
  constructor(protected prompts: Prompts, protected index: Index) {
    super(prompts);
  }

  /**
   *
   * @param groups
   */
  getMenuItems(
    columns: dataColumnType[],
    indexes: dataIndexType[] = [],
    prefixName: string = '',
  ): Array<choicesType<choiceValueSubType>> {
    const title = chalk.underline(`Columns list`);
    const items = this.getColumnItems(columns);
    const header = ['Name', 'Type', 'Required', 'Default', 'Index', 'Unique', 'Sparse'];
    const values = items.map((v) => [
      v.name,
      v.showType || v.type,
      v.required ? '✔' : '',
      v.default,
      ...this.getMenuTableIndex(v, indexes, prefixName),
    ]);

    const rows = table([header.map((s) => chalk.underline(s)), ...values], {
      ...promptTableOptions,
      columns: {
        2: { alignment: 'center' },
        5: { alignment: 'center' },
        6: { alignment: 'center' },
      },
    }).split('\n');

    const choices: Array<choicesType<choiceValueSubType>> = items.map((d, i) => {
      if (d.readonly) {
        return new Separator(rows[i + 1]);
      }

      return {
        name: rows[i + 1],
        value: { value: { type: 'column', data: d } },
        short: `Column - ${d.name}`,
      };
    });

    const extendChoices: Array<choicesType<choiceValueSubType>> = [new Separator(title), new Separator(' ')];

    if (choices.length === 0) {
      extendChoices.push(new Separator(`- No columns defined -`));
    } else {
      extendChoices.push(new Separator(rows[0]));
      extendChoices.push(...choices);
    }

    extendChoices.push(new Separator(' '));
    extendChoices.push(new Separator('Note: Columns "_id", "createdAt" and "updatedAt" are created automatically'));
    extendChoices.push(new Separator(' '));

    return extendChoices;
  }

  /**
   *
   * @param column
   * @param indexes
   */
  getMenuTableIndex(column: dataColumnType, indexes: dataIndexType[], prefixName: string = ''): string[] {
    const index = this.getIndex((prefixName + column.name).replace(/\[\]/g, ''), indexes);

    if (index && typeof index.type) {
      return [index.type as string, index.properties.unique ? '✔' : '', index.properties.sparse ? '✔' : ''];
    }

    return ['', '', ''];
  }

  /**
   *
   * @param columns
   * @param prefixName
   */
  async create(
    columns: dataColumnType[],
    indexes: dataIndexType[] = [],
    prefixName: string = '',
  ): Promise<dataColumnType | false> {
    const names = columns.map((d) => d.name.toLowerCase());

    const answersMain = await this.prompts.call<questions.columnMainAnswersType>(
      questions.columnMainQuestions(undefined, names, blacklist),
    );

    if (answersMain.name === '') {
      return false;
    }

    const column = questions.columnMainEvaluation(undefined, answersMain);

    // Special type: arrayType
    if (column.type === 'arrayType') {
      let subType: dataColumnArrayType | dataColumnType = column;

      do {
        const answersSubType = await this.prompts.call<questions.columnSubTypeAnswersType>(
          questions.columnSubTypeQuestions(subType),
        );

        subType = questions.columnSubTypeEvaluation(subType, answersSubType);
      } while (subType.type === 'arrayType');
    }

    // Special type: array, object
    if (column.type === 'array' || column.type === 'object') {
      column.subColumns = [];
    }

    // Options
    const answersOptions = await this.prompts.call<questions.columnOptionsAnswersType>(
      questions.columnOptionsQuestions(column),
    );
    questions.columnOptionsEvaluation(column, answersOptions);

    // Index
    if (column.type === '2dsphere') {
      // Special index for 2dsphere
      questions.columnIndexEvaluation(column, { mode: 'index', type: '2dsphere' }, indexes, undefined, prefixName);
    } else if (Object.keys(schemaTypesSpecial).indexOf(column.type) === -1) {
      const answersIndex = await this.prompts.call<questions.columnIndexAnswersType>(questions.columnIndexQuestions());

      questions.columnIndexEvaluation(column, answersIndex, indexes, undefined, prefixName);
    }

    return column;
  }

  /**
   *
   * @param columns
   * @param column
   * @param indexes
   * @param prefixName
   */
  async edit(
    columns: dataColumnType[],
    column: dataColumnType,
    indexes: dataIndexType[] = [],
    prefixName: string = '',
  ): Promise<void> {
    const name = column.name;
    const names = columns.filter((d) => d.name !== name).map((d) => d.name.toLowerCase());
    const index = this.getIndex(prefixName + column.name, indexes);

    const answersMain = await this.prompts.call<questions.columnMainAnswersType>(
      questions.columnMainQuestions(column, names, blacklist),
    );

    if (answersMain.name === '') {
      return;
    }

    questions.columnMainEvaluation(column, answersMain);

    // Special type: arrayType
    if (column.type === 'arrayType') {
      let subType: dataColumnArrayType | dataColumnType = column;

      do {
        const answersSubType = await this.prompts.call<questions.columnSubTypeAnswersType>(
          questions.columnSubTypeQuestions(subType),
        );

        subType = questions.columnSubTypeEvaluation(subType, answersSubType);
      } while (subType.type === 'arrayType');

      delete subType.subType;
    } else {
      delete column.subType;
    }

    // Special type: array, object
    if (column.type === 'array' || column.type === 'object') {
      if (!column.subColumns) {
        column.subColumns = [];
      }
    } else {
      delete column.subColumns;
    }

    // Options
    const columnOptions = await this.prompts.call<dataColumnType & { options: string[] }>(
      questions.columnOptionsQuestions(column),
    );
    questions.columnOptionsEvaluation(column, columnOptions);

    // Index
    if (column.type === '2dsphere') {
      // Special index for 2dsphere
      questions.columnIndexEvaluation(column, { mode: 'index', type: '2dsphere' }, [], index, prefixName);
    } else if (Object.keys(schemaTypesSpecial).indexOf(column.type) === -1) {
      const answersIndex = await this.prompts.call<questions.columnIndexAnswersType>(
        questions.columnIndexQuestions(index),
      );

      questions.columnIndexEvaluation(column, answersIndex, indexes, index, prefixName);
    }

    // Indexes
    if (name !== column.name) {
      this.updateIndexes(indexes, name, column.name);
    }
  }

  /**
   *
   * @param items
   * @param withoutBrackets
   * @param path
   */
  getColumnItems(items: dataColumnType[], withoutBrackets = false, path = '') {
    return items.reduce<dataColumnType[]>(
      (acc, item) => acc.concat(this.getColumnItem(item, withoutBrackets, path)),
      [],
    );
  }

  /**
   *
   * @param item
   * @param withoutBrackets
   * @param path
   */
  getColumnItem(item: dataColumnType, withoutBrackets = false, path: string): dataColumnType[] {
    const name: string = path + item.name;
    let items: dataColumnType[] = [];
    let type: string = item.type;

    if (item.type === 'object' && item.subColumns) {
      items = items.concat(this.getColumnItems(item.subColumns, withoutBrackets, name + '.'));
    }

    if (item.type === 'array' && item.subColumns) {
      items = items.concat(
        this.getColumnItems(item.subColumns, withoutBrackets, name + (withoutBrackets ? '.' : '[].')),
      );
      type = '[object]';
    }

    if (item.type === 'arrayType' && item.subType) {
      type = `[${this.getColumnSubTypeItem(item.subType)}]`;
    }

    return [{ ...item, name, showType: type, readonly: path !== '' || item.readonly }, ...items];
  }

  /**
   *
   * @param item
   */
  getColumnSubTypeItem(item: dataColumnArrayType): string {
    if (item.type === 'arrayType' && item.subType) {
      return `[${this.getColumnSubTypeItem(item.subType)}]`;
    }

    return item.type;
  }

  /**
   *
   * @param data
   * @param withLastColumn
   * @param withoutBrackets
   */
  getPathName(data: dataColumnGroupType, withLastColumn = true, withoutBrackets = false) {
    const name: string[] = [];

    if (withLastColumn) {
      if (!withoutBrackets && data.column.type === 'array') {
        name.push(data.column.name + '[]');
      } else {
        name.push(data.column.name);
      }
    }

    if (data.parent) {
      name.unshift(this.getPathName(data.parent, true, withoutBrackets));
    }

    return name.join('.');
  }

  /**
   *
   * @param columnName
   * @param indexes
   */
  getIndex(columnName: string, indexes: dataIndexType[]): dataIndexType | undefined {
    for (const index of indexes) {
      if (index.readonly === true && index.mode && index.type && Object.keys(index.columns).length === 1) {
        const indexName = questions.getIndexName(columnName, index.mode, '');

        if (index.name === indexName && typeof index.columns[columnName] !== 'undefined') {
          return index;
        }
      }
    }

    return;
  }

  /**
   *
   * @param indexes
   * @param oldColumndName
   * @param newColumndName
   */
  updateIndexes(indexes: dataIndexType[], oldColumnName: string, newColumnName: string) {
    indexes.forEach((index) => {
      if (typeof index.columns[oldColumnName] !== 'undefined') {
        index.columns[newColumnName] = index.columns[oldColumnName];

        delete index.columns[oldColumnName];
      }
    });
  }

  /**
   *
   * @param a
   * @param b
   */
  sort(a: dataColumnType, b: dataColumnType) {
    const pathA = a.name.toLowerCase();
    const pathB = b.name.toLowerCase();

    if (pathA === pathB) {
      return 0;
    }

    return pathA < pathB ? -1 : 1;
  }
}
