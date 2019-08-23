import * as fs from 'fs';
import { join } from 'path';
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
  protected path = './schemas-mongodb.json';

  protected data: dataType = {
    groups: [],
  };

  /**
   *
   * @param pathProject
   * @param pathData
   * @param prompts
   * @param prettier
   */
  constructor(
    pathProject: string,
    pathData: string | undefined,
    protected prompts: Prompts,
    protected prettier: Options,
  ) {
    this.path = join(pathData || join(pathProject, this.path));
  }

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
