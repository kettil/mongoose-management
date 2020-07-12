import Prompts from '../../prompts';
import AbstractDataset from '../dataset/abstract';
import GroupDataset from '../dataset/group';
import { BackToCollectionError, CancelPromptError } from '../errors';
import AbstractMenu from '../menu/abstract';

import { choiceValueType, levelOptionsType } from '../../types';

export default abstract class AbstractLevel<
  T extends AbstractDataset<P>,
  S extends AbstractDataset<any>,
  M extends AbstractMenu<T, S>,
  P = undefined
> {
  protected abstract promptCreate: (prompts: Prompts, dataset: T) => Promise<S>;
  protected abstract promptEdit: (prompts: Prompts, parent: P, dataset: T) => Promise<T>;

  protected prompts: Prompts;

  constructor(protected dataset: T, protected menu: M, protected options: levelOptionsType) {
    this.prompts = options.prompts;
  }

  async showMenu(): Promise<choiceValueType<S>> {
    const result = await this.menu.exec(this.dataset);

    return result;
  }

  async create(action: choiceValueType<S>['action']): Promise<S | undefined> {
    const dataset = await this.promptCreate(this.prompts, this.dataset);

    return dataset;
  }

  async edit(dataset: T): Promise<boolean> {
    const parent = dataset.getParent();

    if (!parent) {
      throw Error('Parent dataset is not defined');
    }

    await this.promptEdit(this.prompts, parent, dataset);

    return false;
  }

  async remove(dataset: T): Promise<boolean> {
    const confirm = await this.prompts.remove(dataset.getName());

    if (confirm) {
      dataset.remove();
    }

    return !confirm;
  }

  show(dataset: S): Promise<void> {
    throw new Error('Next menu level is not defined');
  }

  async exec() {
    let status: boolean;

    do {
      this.prompts.clear();
      status = await this.run();
    } while (status);
  }

  // tslint:disable-next-line:cyclomatic-complexity
  async run(): Promise<boolean> {
    const result = await this.showMenu();
    let status = true;

    try {
      switch (result.action) {
        case 'exit':
          await this.prompts.exit();
          break;

        case 'back':
          return false;

        case 'backToCollection':
          throw new BackToCollectionError('back');

        case 'write':
          const d = this.dataset;
          if (d instanceof GroupDataset) {
            await this.options.storage.write(false);
            await this.options.creater.exec(d.getPath(), d.getObject());
          }
          break;

        case 'save':
          await this.options.storage.write();
          break;

        case 'remove':
          status = await this.remove(this.dataset);
          break;

        case 'edit':
          status = await this.edit(this.dataset);
          break;

        case 'create':
        case 'createColumn':
        case 'createIndex':
          const dataset = await this.create(result.action);

          if (dataset) {
            await this.show(dataset);
          }
          break;

        default:
          if (result.data) {
            await this.show(result.data);
          }
      }
    } catch (err) {
      if (!(err instanceof Error) || err instanceof BackToCollectionError) {
        throw err;
      }

      if (!(err instanceof CancelPromptError)) {
        await this.prompts.pressKey(err);
      }
    }

    return status;
  }
}
