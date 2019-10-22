import { Separator } from 'inquirer';

import IndexDataset from '../dataset/index';

import AbstractMenu from './abstract';

export default class IndexMenu extends AbstractMenu<IndexDataset, IndexDataset> {
  async exec(index: IndexDataset) {
    const result = await this.prompts.menu<IndexDataset>(`Choose a command for the index "${index.getName()}":`, [
      this.getMenuChoiceEdit('index'),
      this.getMenuChoiceRemove('index'),
      this.getMenuChoiceBack(),
      new Separator(' '),
    ]);

    return result;
  }
}
