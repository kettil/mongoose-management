import chalk from 'chalk';

import { choiceType, choiceValueType, cliOptionsType, dataCollectionType, dataGroupType } from '../../types';

/**
 *
 *
 */
export default abstract class AbstractHandler<T, R, P> {
  /**
   *
   * @param options
   */
  constructor(protected data: T, protected parent: P, protected options: cliOptionsType) {}

  /**
   *
   */
  abstract async menu(): Promise<choiceValueType<R>>;

  /**
   *
   * @param value
   */
  abstract async create(value?: R): Promise<R | false>;

  /**
   *
   * @param value
   */
  abstract async edit(value?: R): Promise<boolean>;

  /**
   *
   * @param value
   */
  abstract async remove(value?: R): Promise<boolean>;

  /**
   *
   * @param value
   */
  abstract async show(value: R): Promise<void>;

  /**
   *
   * @param handler
   */
  async exec() {
    let status: boolean;

    do {
      this.options.prompts.clear();
      status = await this.run();
    } while (status);
  }

  /**
   *
   * @param handler
   */
  async run(): Promise<boolean> {
    const result = await this.menu();

    switch (result.type) {
      case 'exit':
        await this.options.prompts.exit();
        break;

      case 'back':
        return false;
        break;

      case 'write':
        if (this.isCollectionsGroup(this.data) && this.isGroupsGroup(this.parent)) {
          await this.options.storage.write(false);
          await this.options.createTemplate.exec(this.parent.path, this.data);
        }
        break;

      case 'save':
        await this.options.storage.write();
        break;

      case 'remove':
        const rRemove = await this.remove(result.value);

        return rRemove;
        break;

      case 'edit':
        const rEdit = await this.edit(result.value);

        return rEdit;
        break;

      case 'create':
        const value = await this.create(result.value);

        if (value) {
          await this.show(value);
        }
        break;

      default:
        if (result.value) {
          await this.show(result.value);
        }
    }

    return true;
  }

  /**
   *
   * @param type
   * @param value
   */
  getMenuItemCreate(type: string, value?: R): choiceType<R> {
    return {
      name: `Create new ${type}`,
      value: { type: 'create', value },
      short: chalk.red(`Command - Create ${type}`),
    };
  }

  /**
   *
   * @param type
   * @param value
   */
  getMenuItemEdit(type: string, value?: R): choiceType<R> {
    return {
      name: `Edit ${type}`,
      value: { type: 'edit', value },
      short: chalk.red(`Command - Edit ${type}`),
    };
  }

  /**
   *
   * @param type
   * @param value
   */
  getMenuItemRemove(type: string, value?: R): choiceType<R> {
    return {
      name: `Remove ${type}`,
      value: { type: 'remove', value },
      short: chalk.red(`Command - Remove ${type}`),
    };
  }

  /**
   *
   */
  getMenuItemSave(): choiceType<R> {
    return {
      name: `Save`,
      value: { type: 'save' },
      short: chalk.red(`Command - Save`),
    };
  }

  /**
   *
   */
  getMenuItemWrite(): choiceType<R> {
    return {
      name: `Save and Write`,
      value: { type: 'write' },
      short: chalk.red(`Command - Write`),
    };
  }

  /**
   *
   */
  getMenuItemBack(): choiceType<R> {
    return {
      name: `Back`,
      value: { type: 'back' },
      short: chalk.red(`Command - Back`),
    };
  }

  /**
   *
   */
  getMenuItemExit(): choiceType<R> {
    return {
      name: `Exit`,
      value: { type: 'exit' },
      short: chalk.red(`Command - Exit`),
    };
  }

  /**
   *
   * @param data
   */
  isCollectionsGroup(data: any): data is dataCollectionType[] {
    if (!Array.isArray(data) || data.length === 0) {
      return false;
    }

    return data[0].name && data[0].columns && data[0].indexes;
  }

  /**
   *
   * @param data
   */
  isGroupsGroup(data: any): data is dataGroupType {
    return typeof data.path === 'string' && Array.isArray(data.collections);
  }
}
