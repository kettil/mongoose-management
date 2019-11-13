import chalk from 'chalk';
import { Separator } from 'inquirer';
import { table } from 'table';

import Prompts, { promptTableOptions } from '../../prompts';

import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import IndexDataset from '../dataset/index';

import AbstractMenu from './abstract';
import ColumnMenu from './column';

import { choicesType } from '../../types';

export default class CollectionMenu extends AbstractMenu<CollectionDataset, ColumnDataset | IndexDataset> {
  protected columnMenu: ColumnMenu;

  constructor(protected prompts: Prompts) {
    super(prompts);

    this.columnMenu = new ColumnMenu(prompts);
  }

  async exec(collection: CollectionDataset) {
    const choicesColumns = this.columnMenu.getChoiceList(collection.flatColumns());
    const choicesIndexes = this.getChoiceIndexList(collection.getIndexes());

    const result = await this.prompts.menu<ColumnDataset | IndexDataset>('Choose a column/index or a command:', [
      new Separator(`Collection: ${chalk.reset.bold(collection.getName())}`),
      new Separator(' '),
      new Separator(chalk.underline('Columns list')),
      new Separator(' '),
      ...choicesColumns,
      new Separator(chalk.underline('Indexes list')),
      new Separator(' '),
      ...choicesIndexes,
      new Separator(),
      this.getMenuChoiceCreate('column', 'createColumn'),
      this.getMenuChoiceCreate('index', 'createIndex'),
      this.getMenuChoiceEdit('collection'),
      this.getMenuChoiceRemove('collection'),
      this.getMenuChoiceBack(),
      new Separator(' '),
    ]);

    return result;
  }

  getChoiceIndexList(indexes: IndexDataset[]): Array<choicesType<IndexDataset>> {
    const rows = this.createIndexTable(indexes);
    const choices = [];
    const indexChoices = indexes.map<choicesType<IndexDataset>>((d, i) => {
      if (d.isReadonly()) {
        return new Separator(rows[i + 1]);
      }

      return {
        name: rows[i + 1],
        value: { data: d },
        short: `Index - ${d.getName()}`,
      };
    });

    if (indexChoices.length === 0) {
      choices.push(new Separator('- No indexes defined -'));
    } else {
      choices.push(new Separator(rows[0]));
      choices.push(...indexChoices);
    }

    choices.push(new Separator(' '));

    return choices;
  }

  createIndexTable(indexes: IndexDataset[]) {
    const header = ['Name', 'Column(s)', 'Unique', 'Sparse'];
    const values = indexes.map((index: IndexDataset) => [
      index.getName(),
      index
        .getColumns()
        .map(([k, v]) => `${k.getFullname(false, false)}: ${v}`)
        .join(', '),
      index.getProperty('unique') ? '✔' : '',
      index.getProperty('sparse') ? '✔' : '',
    ]);

    return table([header.map((s) => chalk.underline(s)), ...values], {
      ...promptTableOptions,
      columns: { 2: { alignment: 'center' }, 3: { alignment: 'center' } },
    }).split('\n');
  }
}
