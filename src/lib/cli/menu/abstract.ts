import chalk from 'chalk';

import Prompts from '../../prompts';

import { choiceType, choiceValueType } from '../../types';

export default abstract class AbstractMenu<T, S> {
  constructor(protected prompts: Prompts) {}

  abstract exec(item: T): Promise<choiceValueType<S>>;

  getMenuChoiceCreate(type: string, action: 'create' | 'createColumn' | 'createIndex' = 'create'): choiceType<S> {
    return {
      name: `Create new ${type}`,
      value: { action },
      short: chalk.red(`Command - Create ${type}`),
    };
  }

  getMenuChoiceEdit(type: string, data?: S): choiceType<S> {
    return {
      name: `Edit ${type}`,
      value: { action: 'edit', data },
      short: chalk.red(`Command - Edit ${type}`),
    };
  }

  getMenuChoiceRemove(type: string, data?: S): choiceType<S> {
    return {
      name: `Remove ${type}`,
      value: { action: 'remove', data },
      short: chalk.red(`Command - Remove ${type}`),
    };
  }

  getMenuChoiceSave(): choiceType<S> {
    return {
      name: 'Save',
      value: { action: 'save' },
      short: chalk.red('Command - Save'),
    };
  }

  getMenuChoiceWrite(): choiceType<S> {
    return {
      name: 'Save and Write',
      value: { action: 'write' },
      short: chalk.red('Command - Write'),
    };
  }

  getMenuChoiceBack(): choiceType<S> {
    return {
      name: 'Back',
      value: { action: 'back' },
      short: chalk.red('Command - Back'),
    };
  }

  getMenuChoiceBackToCollection(): choiceType<S> {
    return {
      name: 'Back to collection',
      value: { action: 'backToCollection' },
      short: chalk.red('Command - Back to collection'),
    };
  }

  getMenuChoiceExit(): choiceType<S> {
    return {
      name: 'Exit',
      value: { action: 'exit' },
      short: chalk.red('Command - Exit'),
    };
  }
}
