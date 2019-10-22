import fs from 'fs';
import { join } from 'path';
import { promisify } from 'util';

import { format, Options } from 'prettier';

import GroupsDataset from './cli/dataset/groups';
import converter from './converter';

import Prompts from './prompts';

export const writeFile = promisify(fs.writeFile);
export const readFile = promisify(fs.readFile);

export default class Storage {
  protected path = './schemas-mongodb.json';

  protected data: GroupsDataset;

  constructor(
    protected pathProject: string,
    pathData: string | undefined,
    protected prompts: Prompts,
    protected prettier: Options,
  ) {
    this.path = join(pathData || join(pathProject, this.path));

    this.data = new GroupsDataset({ groups: [] }, pathProject);
    this.data.setReference();
  }

  async load(): Promise<GroupsDataset> {
    const spinner = this.prompts.getSpinner();

    spinner.start('Database schemata are loaded!');

    try {
      const json = await readFile(this.path, { encoding: 'utf8' });
      const data = JSON.parse(json);

      converter(data);

      this.data = new GroupsDataset(data, this.pathProject);
      this.data.setReference();
    } catch (err) {
      if (err.code !== 'ENOENT') {
        spinner.fail();
        throw err;
      }
    }

    spinner.succeed();

    return this.data;
  }

  async write(withPressKey = true): Promise<void> {
    const spinner = this.prompts.getSpinner();

    spinner.start('Database schemata are saved!');
    try {
      const json = JSON.stringify(this.data.getObject());
      const pretty = format(json, { ...this.prettier, parser: 'json' });

      await writeFile(this.path, pretty, { encoding: 'utf8' });
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
