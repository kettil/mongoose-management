/* tslint:disable:no-console */
import chalk from 'chalk';
import { DistinctQuestion, prompt, registerPrompt, Separator } from 'inquirer';
import inquirerFuzzyPath from 'inquirer-fuzzy-path';
import ora from 'ora';
import { getBorderCharacters, TableUserConfig } from 'table';

import { choiceValueType } from './types';

export const regexpName = /^[a-z](?:[a-zA-Z0-9_-]*[a-zA-Z0-9])?$|^$/;
export const regexpNameMessage = `Only letters, numbers and hyphens are allowed and the first character must be a small letter! (RegExp: ${regexpName.source})`;

export const promptTableOptions: TableUserConfig = {
  drawHorizontalLine: () => false,
  border: {
    ...getBorderCharacters(`norc`),
    bodyLeft: chalk.dim('|'),
    bodyRight: chalk.dim('|'),
    bodyJoin: chalk.dim('|'),
  },
};

/**
 *
 */
export default class Prompts {
  private options = {
    pageSize: 75,
    prefix: '🎃',

    filter: (value: any) => (typeof value === 'string' ? value.trim() : value),
  };

  /**
   *
   * @param clearScreen
   */
  constructor(protected clearScreen: boolean = true) {
    registerPrompt('fuzzypath', inquirerFuzzyPath);
  }

  /**
   *
   */
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

  /**
   *
   */
  clear() {
    if (this.clearScreen) {
      // https://github.com/bahamas10/node-clear
      process.stdout.write('\x1b[2J');
      process.stdout.write('\x1b[0f');
    }
  }

  /**
   *
   * @param message
   */
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

  /**
   *
   */
  async remove(): Promise<boolean> {
    const { remove } = await this.call<{ remove: boolean }>([
      {
        type: 'confirm',
        name: 'remove',
        message: 'Really delete it?',
        default: false,
      },
    ]);

    return remove;
  }

  /**
   *
   * @param messages
   */
  async pressKey(messages?: string | string[], isError = false): Promise<void> {
    if (messages) {
      const prefix = isError ? chalk.red('>>') : chalk.green('>>');

      if (isError) {
        console.log(`${prefix} Error!`);
      }
      if (Array.isArray(messages)) {
        messages.forEach((message) => console.log(`${prefix} ${message}`));
      } else {
        console.log(`${prefix} ${messages}`);
      }
    }

    await this.call([
      {
        type: 'input',
        name: 'press',
        message: 'Press a key',
      },
    ]);
  }

  /**
   *
   * @param questions
   */
  async call<T>(questions: ReadonlyArray<DistinctQuestion>): Promise<T> {
    const result = await prompt<T>(questions.map((question) => ({ ...this.options, ...question })));

    return result;
  }

  /**
   *
   * @param message
   * @param choices
   */
  async menu<T, R>(message: string, choices: Array<T | InstanceType<typeof Separator>>): Promise<choiceValueType<R>> {
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

  /**
   *
   */
  getSpinner(): ora.Ora {
    return ora({
      prefixText: chalk.green('>>'),
    });
  }
}
