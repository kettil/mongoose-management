jest.mock('../../prompts');

import chalk from 'chalk';

import Prompts from '../../prompts';

import AbstractMenu from './abstract';

describe('Check the AbstractMenu class', () => {
  let prompts: any;
  let menu: any;

  beforeEach(() => {
    prompts = new Prompts();

    menu = new (AbstractMenu as any)(prompts);
  });

  test('initialize the class', () => {
    expect(menu).toBeInstanceOf(AbstractMenu);

    expect(menu.prompts).toBe(prompts);
  });

  test('it should be return the menu item when getMenuChoiceCreate() is called', () => {
    const result = menu.getMenuChoiceCreate('column');

    expect(result).toEqual({
      name: 'Create new column',
      short: chalk.red('Command - Create column'),
      value: { action: 'create' },
    });
  });

  test('it should be return the menu item when getMenuChoiceEdit() is called', () => {
    const result = menu.getMenuChoiceEdit('collection', { isData: true });

    expect(result).toEqual({
      name: 'Edit collection',
      short: chalk.red('Command - Edit collection'),
      value: { action: 'edit', data: { isData: true } },
    });
  });

  test('it should be return the menu item when getMenuChoiceRemove() is called', () => {
    const result = menu.getMenuChoiceRemove('group', { isData: true });

    expect(result).toEqual({
      name: 'Remove group',
      short: chalk.red('Command - Remove group'),
      value: { action: 'remove', data: { isData: true } },
    });
  });

  test('it should be return the menu item when getMenuChoiceSave() is called', () => {
    const result = menu.getMenuChoiceSave();

    expect(result).toEqual({
      name: 'Save',
      short: chalk.red('Command - Save'),
      value: { action: 'save' },
    });
  });

  test('it should be return the menu item when getMenuChoiceWrite() is called', () => {
    const result = menu.getMenuChoiceWrite();

    expect(result).toEqual({
      name: 'Save and Write',
      short: chalk.red('Command - Write'),
      value: { action: 'write' },
    });
  });

  test('it should be return the menu item when getMenuChoiceBack() is called', () => {
    const result = menu.getMenuChoiceBack();

    expect(result).toEqual({
      name: 'Back',
      short: chalk.red('Command - Back'),
      value: { action: 'back' },
    });
  });

  test('it should be return the menu item when getMenuChoiceBackToCollection() is called', () => {
    const result = menu.getMenuChoiceBackToCollection();

    expect(result).toEqual({
      name: 'Back to collection',
      short: chalk.red('Command - Back to collection'),
      value: { action: 'backToCollection' },
    });
  });

  test('it should be return the menu item when getMenuChoiceExit() is called', () => {
    const result = menu.getMenuChoiceExit();

    expect(result).toEqual({
      name: 'Exit',
      short: chalk.red('Command - Exit'),
      value: { action: 'exit' },
    });
  });
});
