import chalk from 'chalk';
import { Separator } from 'inquirer';
import { table } from 'table';

import { promptTableOptions } from '../../prompts';
import ColumnDataset from '../dataset/column';
import AbstractMenu from './abstract';

import { choicesType, choiceValueType } from '../../types';
import CollectionDataset from '../dataset/collection';

export default class ColumnMenu extends AbstractMenu<ColumnDataset, ColumnDataset> {
  async exec(column: ColumnDataset) {
    const choices = this.getChoiceList(column.flatColumns(), column);
    let result: choiceValueType<ColumnDataset>;

    if (column.get('type') === 'array' || column.get('type') === 'object') {
      result = await this.prompts.menu<ColumnDataset>(
        `Choose a subcolumn or a command for the column "${column.getFullname(true)}":`,
        [
          new Separator(chalk.underline('Columns list')),
          new Separator(' '),
          ...choices,
          this.getMenuChoiceCreate('subcolumn'),
          this.getMenuChoiceEdit('column'),
          this.getMenuChoiceRemove('column'),
          this.getMenuChoiceBack(),
          new Separator(' '),
        ],
      );
    } else {
      result = await this.prompts.menu<ColumnDataset>(
        `Choose a command for the column "${column.getFullname(true)}":`,
        [
          this.getMenuChoiceEdit('column'),
          this.getMenuChoiceRemove('column'),
          this.getMenuChoiceBack(),
          new Separator(' '),
        ],
      );
    }

    return result;
  }

  getChoiceList(columns: ColumnDataset[], selected?: ColumnDataset): Array<choicesType<ColumnDataset>> {
    const rows = this.createTable(columns, selected);
    const choices = [];
    const columnChoices = columns.map<choicesType<ColumnDataset>>((d, i) => {
      const parent = d.getParent();

      if (d.isReadonly() || (parent !== selected && !(parent instanceof CollectionDataset))) {
        return new Separator(rows[i + 1]);
      }

      return {
        name: rows[i + 1],
        value: { data: d },
        short: `Column - ${d.getName()}`,
      };
    });

    if (columnChoices.length === 0) {
      choices.push(new Separator('- No columns defined -'));
    } else {
      choices.push(new Separator(rows[0]));
      choices.push(...columnChoices);
    }

    choices.push(new Separator(' '));

    if (!selected) {
      choices.push(new Separator('Note: Columns "_id", "createdAt" and "updatedAt" are created automatically'));
      choices.push(new Separator(' '));
    }

    return choices;
  }

  createTable(columns: ColumnDataset[], selected?: ColumnDataset) {
    const header = ['Name', 'Type', 'Required', 'Default', 'Index', 'Unique', 'Sparse'];
    const values = columns.map((c) => [
      c.getTableName(selected),
      c.getTableType(),
      c.get('required') ? '✔' : '',
      c.get('default'),
      ...this.createTableIndexRow(c),
    ]);

    return table([header.map((s) => chalk.underline(s)), ...values], {
      ...promptTableOptions,
      columns: {
        2: { alignment: 'center' },
        5: { alignment: 'center' },
        6: { alignment: 'center' },
      },
    }).split('\n');
  }

  createTableIndexRow(column: ColumnDataset): [string | number | undefined, string, string] {
    const value = column.getIndexValue();
    const type = column.getIndexType();

    return [value, type === 'unique' ? '✔' : '', type === 'sparse' ? '✔' : ''];
  }
}
