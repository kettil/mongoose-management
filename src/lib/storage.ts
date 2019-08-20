import * as fs from 'fs';
import { promisify } from 'util';

import { format, Options } from 'prettier';

import Prompts from './prompts';

import { dataType } from './types';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

/**
 *
 */
export default class Storage {
  protected path = './mongodb-schema.json';

  protected data: dataType = {
    groups: [],
  };

  /**
   *
   * @param prompts
   */
  constructor(protected prompts: Prompts, protected prettier: Options) {}

  /**
   *
   */
  async load(): Promise<dataType> {
    const spinner = this.prompts.getSpinner();

    spinner.start('Database schemata are loaded!');
    try {
      const data = await readFile(this.path, { encoding: 'utf8' });

      this.data = JSON.parse(data);
    } catch (err) {
      if (err.code !== 'ENOENT') {
        spinner.fail();
        throw err;
      }
    }
    spinner.succeed();

    return this.data;
  }

  /**
   *
   */
  async write(withPressKey = true): Promise<void> {
    const spinner = this.prompts.getSpinner();

    spinner.start('Database schemata are saved!');
    try {
      const json = JSON.stringify(this.data);

      await writeFile(this.path, format(json, { ...this.prettier, parser: 'json' }), { encoding: 'utf8' });
    } catch (err) {
      spinner.fail();
      throw err;
    }
    spinner.succeed();

    if (withPressKey) {
      await this.prompts.pressKey();
    }
  }
}
