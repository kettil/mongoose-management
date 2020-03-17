/* tslint:disable:no-console */
import chalk from 'chalk';
import { DistinctQuestion, prompt, registerPrompt } from 'inquirer';
import inquirerFuzzyPath from 'inquirer-fuzzy-path';
import ora from 'ora';
import { getBorderCharacters, TableUserConfig } from 'table';

import { choicesType, choiceValueType } from './types';

export const regexpName = /^[a-z](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$|^$/;
export const regexpNameMessage = `Only letters, numbers and hyphens are allowed and the first character must be a small letter! (RegExp: ${regexpName.source})`;

export const promptTableOptions: TableUserConfig = {
  drawHorizontalLine: () => false,
  border: {
    ...getBorderCharacters('norc'),
    bodyLeft: chalk.dim('|'),
    bodyRight: chalk.dim('|'),
    bodyJoin: chalk.dim('|'),
  },
};

export default class Prompts {
  private options: Record<string, any> = {
    pageSize: 75,
    filter: (value: any) => (typeof value === 'string' ? value.trim() : value),
  };

  private defaultItem = '🎯';
  private items: Array<[[number, number], [number, number], string]> = [
    [[6, 1], [8, 15], '⛺'],
    [[3, 21], [4, 25], '🐰'],
    [[10, 24], [11, 8], '🎃'],
    [[12, 31], [12, 31], '🎉'],
    [[12, 1], [12, 31], '🎄'],
    [[11, 1], [12, 31], '⛄'],
    [[1, 1], [3, 31], '⛄'],
  ];

  constructor(protected clearScreen: boolean = true) {
    registerPrompt('fuzzypath', inquirerFuzzyPath);

    this.options.prefix = this.getIcon(new Date());
  }

  async exit() {
    const { confirm } = await this.call<{ confirm: boolean }>([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Generator really quit?',
        default: false,
      },
    ]);

    if (confirm) {
      console.log();
      console.log(chalk.bold('Bye Bye 🖖'));
      console.log();

      process.exit();
    }
  }

  clear() {
    if (this.clearScreen) {
      // https://github.com/bahamas10/node-clear
      process.stdout.write('\x1b[2J');
      process.stdout.write('\x1b[0f');
    }
  }

  async retry(message: string): Promise<boolean> {
    const prefix = chalk.red('>>');

    console.log(`${prefix} Error!`);
    console.log(`${prefix} ${message}`);

    const { retry } = await this.call<{ retry: boolean }>([
      {
        type: 'confirm',
        name: 'retry',
        message: 'Retry?',
        default: false,
      },
    ]);

    return retry;
  }

  async remove(name: string): Promise<boolean> {
    const { remove } = await this.call<{ remove: boolean }>([
      {
        type: 'confirm',
        name: 'remove',
        message: `Really delete "${name}"?`,
        default: false,
      },
    ]);

    return remove;
  }

  async pressKey(messages?: string | string[] | Error, isError = false): Promise<void> {
    if (messages) {
      let isException = false;

      if (messages instanceof Error) {
        isException = true;
        isError = true;

        messages = messages.stack ? messages.stack.split('\n') : messages.message.split('\n');
      }

      const prefix = isError ? chalk.red('>>') : chalk.green('>>');

      if (isError && !isException) {
        console.log(`${prefix} Error`);
      }

      if (Array.isArray(messages)) {
        messages.forEach((message) => console.log(`${prefix} ${message}`));
      } else {
        console.log(`${prefix} ${messages}`);
      }

      console.log(prefix);
    }

    await this.call([
      {
        type: 'input',
        name: 'press',
        message: 'Press a key',
      },
    ]);
  }

  async call<T>(questions: ReadonlyArray<DistinctQuestion>): Promise<T> {
    const result = await prompt<T>(questions.map((question) => ({ ...this.options, ...question })));

    return result;
  }

  async menu<T>(message: string, choices: Array<choicesType<T>>): Promise<choiceValueType<T>> {
    const { value } = await prompt([
      {
        ...this.options,

        type: 'list',
        name: 'value',
        message,
        choices,
      },
    ]);

    return value;
  }

  getIcon(time: Date) {
    const year = time.getFullYear();
    const now = time.getTime();

    for (const [[beginMonth, beginDay], [endMonth, endDay], icon] of this.items) {
      const begin = new Date(year, beginMonth - 1, beginDay, 0, 0, 0, 0).getTime();
      const end = new Date(year, endMonth - 1, endDay + 1, 0, 0, 0, 0).getTime();

      if (begin <= now && now < end) {
        return icon;
      }
    }

    return this.defaultItem;
  }

  getSpinner(): ora.Ora {
    return ora({
      prefixText: chalk.green('>>'),
    });
  }
}
