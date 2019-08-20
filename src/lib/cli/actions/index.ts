import chalk from 'chalk';
import { Separator } from 'inquirer';
import { table } from 'table';

import { promptTableOptions } from '../../prompts';
import * as questions from '../questions';
import AbstractAction from './abstract';

import { choicesType, choiceValueSubType, dataColumnType, dataIndexType } from '../../types';

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
    const answersMain = await this.prompts.call<questions.indexMainAnswersType>(
      questions.indexMainQuestions(undefined, indexes, columnList),
    );

    if (answersMain.name === '' || answersMain.columns.length === 0) {
      return false;
    }

    const index = questions.indexMainEvaluation(undefined, answersMain);

    // columns
    const answersColumns = await this.prompts.call<questions.indexColumnsAnswersType>(
      questions.indexColumnsQuestions(index, answersMain.columns),
    );

    try {
      questions.indexColumnsEvaluation(index, answersColumns, indexes);
    } catch (err) {
      if (typeof err === 'string') {
        await this.prompts.pressKey(err, true);

        return false;
      }

      throw err;
    }

    // options
    const answersOptions = await this.prompts.call<questions.indexOptionsAnswersType>(
      questions.indexOptionsQuestions(index),
    );

    questions.indexOptionsEvaluation(index, answersOptions);

    return index;
  }

  /**
   *
   * @param indexes
   * @param index
   */
  async edit(indexes: dataIndexType[], index: dataIndexType, columnList: dataColumnType[] = []): Promise<void> {
    const answersMain = await this.prompts.call<questions.indexMainAnswersType>(
      questions.indexMainQuestions(index, indexes, columnList),
    );

    if (answersMain.name === '' || answersMain.columns.length === 0) {
      return;
    }

    // columns
    const answersColumns = await this.prompts.call<questions.indexColumnsAnswersType>(
      questions.indexColumnsQuestions(index, answersMain.columns),
    );

    try {
      questions.indexColumnsEvaluation(index, answersColumns, indexes);
    } catch (err) {
      if (typeof err === 'string') {
        await this.prompts.pressKey(err, true);

        return;
      }

      throw err;
    }

    questions.indexMainEvaluation(index, answersMain);

    // options
    const answersOptions = await this.prompts.call<questions.indexOptionsAnswersType>(
      questions.indexOptionsQuestions(index),
    );

    questions.indexOptionsEvaluation(index, answersOptions);
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
}
