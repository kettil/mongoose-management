import Prompts from '../../prompts';

import AbstractDataset from '../dataset/abstract';
import GroupDataset from '../dataset/group';

import AbstractMenu from '../menu/abstract';

import { choiceValueType, levelOptionsType } from '../../types';

/**
 *
 *
 */
export default abstract class AbstractLevel<
  T extends AbstractDataset<P>,
  S extends AbstractDataset<any>,
  M extends AbstractMenu<T, S>,
  P = undefined
> {
  protected abstract promptCreate: (prompts: Prompts, dataset: T) => Promise<S>;
  protected abstract promptEdit: (prompts: Prompts, parent: P, dataset: T) => Promise<T>;

  protected prompts: Prompts;

  /**
   *
   * @param dataset
   * @param prompts
   */
  constructor(protected dataset: T, protected menu: M, protected options: levelOptionsType) {
    this.prompts = options.prompts;
  }

  /**
   *
   */
  async showMenu(): Promise<choiceValueType<S>> {
    const result = await this.menu.exec(this.dataset);

    return result;
  }

  /**
   *
   * @param action
   */
  async create(action: choiceValueType<S>['action']): Promise<S | undefined> {
    const dataset = await this.promptCreate(this.prompts, this.dataset);

    return dataset;
  }

  /**
   *
   * @param dataset
   */
  async edit(dataset: T): Promise<boolean> {
    const parent = dataset.getParent();

    if (!parent) {
      throw Error('Parent dataset is not defined');
    }

    await this.promptEdit(this.prompts, parent, dataset);

    return false;
  }

  /**
   *
   * @param dataset
   */
  async remove(dataset: T): Promise<boolean> {
    const confirm = await this.prompts.remove(dataset.getName());

    if (confirm) {
      dataset.remove();
    }

    return !confirm;
  }

  /**
   *
   * @param dataset
   */
  show(dataset: S): Promise<void> {
    throw new Error('Next menu level is not defined');
  }

  /**
   *
   */
  async exec() {
    let status: boolean;

    do {
      this.prompts.clear();
      status = await this.run();
    } while (status);
  }

  /**
   *
   */
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

        case 'write':
          const d = this.dataset;
          if (d instanceof GroupDataset) {
            await this.options.storage.write(false);
            await this.options.creater.exec(d.getPath(), d.getObject().collections);
          }

          /*
          if (this.isCollectionsGroup(this.data) && this.isGroupsGroup(this.parent)) {
            await this.options.storage.write(false);
            await this.options.createTemplate.exec(this.parent.path, this.data);
          }
          */
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
      if (!(err instanceof Error)) {
        throw err;
      }

      if (err.message !== 'cancel') {
        await this.prompts.pressKey(err.message.split('\n'), true);
      }
    }

    return status;
  }
}
