jest.mock('../../prompts');
jest.mock('../../storage');
jest.mock('../../template/create');

import Prompts from '../../prompts';
import Storage from '../../storage';
import Creater from '../../template/create';
import CollectionDataset from '../dataset/collection';
import GroupDataset from '../dataset/group';
import GroupsDataset from '../dataset/groups';
import { BackToCollectionError, CancelPromptError } from '../errors';
import CollectionMenu from '../menu/collection';
import GroupMenu from '../menu/group';

import AbstractLevel from './abstract';

import { choiceValueType } from '../../types';

describe('Check the AbstractLevel class', () => {
  let prompts: any;
  let storage: any;
  let creater: any;
  let dataset: GroupDataset;
  let parent: GroupsDataset;
  let level: any;
  let data: any;
  let menu: any;

  beforeEach(() => {
    prompts = new Prompts();
    storage = new Storage('', '', prompts, {});
    creater = new Creater(prompts, '', '', {});

    menu = new GroupMenu(prompts);

    data = { groups: [{ path: 'path/to/group', collections: [{ name: 'collectionName', columns: [], indexes: [] }] }] };
    parent = new GroupsDataset(data, 'path/to/group');
    dataset = parent.getGroup('path/to/group')!;

    level = new (AbstractLevel as any)(dataset, menu, { prompts, storage, creater });

    level.promptCreate = jest.fn(
      (_, d) => new CollectionDataset({ name: 'cName', columns: [], indexes: [], idType: 'objectId' }, d),
    );
    level.promptEdit = jest.fn((_1, _2, d) => d);
  });

  test('initialize the class', () => {
    expect(level).toBeInstanceOf(AbstractLevel);

    expect(level.dataset).toBeInstanceOf(GroupDataset);
    expect(level.dataset).toBe(dataset);
    expect(level.menu).toBe(menu);
    expect(level.options).toEqual({ prompts, storage, creater });
    expect(level.prompts).toBe(prompts);
  });

  describe('Check the actions function', () => {
    test('it should be call the menu when showMenu() is called', async () => {
      expect.assertions(5);

      (prompts.menu as jest.Mock).mockImplementation(async (message: any, choices: any) => {
        expect(typeof message).toBe('string');
        expect(Array.isArray(choices)).toBe(true);
        expect(choices.length).toBe(14);

        return { action: 'create' };
      });

      const result = await level.showMenu();

      expect(result).toEqual({ action: 'create' });

      expect(prompts.menu).toHaveBeenCalledTimes(1);
    });

    test('it should be call promptCreate function when create() is called', async () => {
      const result = await level.create('create');

      expect(result).toEqual(expect.any(CollectionDataset));

      expect(level.promptCreate).toHaveBeenCalledTimes(1);
      expect(level.promptCreate).toHaveBeenCalledWith(prompts, dataset);
    });

    test('it should be call promptEdit function when edit() is called', async () => {
      const result = await level.edit(dataset);

      expect(result).toBe(false);

      expect(level.promptEdit).toHaveBeenCalledTimes(1);
      expect(level.promptEdit).toHaveBeenCalledWith(prompts, parent, dataset);
    });

    test('it should be call promptEdit function when edit() is called without Parent', async () => {
      dataset.getParent = jest.fn();

      expect.assertions(5);
      try {
        await level.edit(dataset);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Parent dataset is not defined');

        expect(level.promptEdit).toHaveBeenCalledTimes(0);

        expect(dataset.getParent).toHaveBeenCalledTimes(1);
        expect(dataset.getParent).toHaveBeenCalledWith();
      }
    });

    test('it should be call remove prompts function when remove() is called with confirmation ', async () => {
      expect.assertions(5);

      (prompts.remove as jest.Mock).mockImplementation(async (name: any) => {
        expect(typeof name).toBe('string');

        return true;
      });

      expect(parent.getGroups().length).toBe(1);

      const result = await level.remove(dataset);

      expect(result).toBe(false);

      expect(prompts.remove).toHaveBeenCalledTimes(1);
      expect(parent.getGroups().length).toBe(0);
    });

    test('it should be call remove prompts function when remove() is called without confirmation ', async () => {
      expect.assertions(5);

      (prompts.remove as jest.Mock).mockImplementation(async (name: any) => {
        expect(typeof name).toBe('string');

        return false;
      });

      expect(parent.getGroups().length).toBe(1);

      const result = await level.remove(dataset);

      expect(result).toBe(true);

      expect(prompts.remove).toHaveBeenCalledTimes(1);
      expect(parent.getGroups().length).toBe(1);
    });

    test('it should be throw an error when show() is called ', async () => {
      expect.assertions(2);
      try {
        await level.show(dataset);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Next menu level is not defined');
      }
    });

    test('it should be run() is called twice when exec() is called ', async () => {
      level.run = jest.fn();
      level.run.mockResolvedValueOnce(true);
      level.run.mockResolvedValueOnce(false);

      await level.exec();

      expect(level.run).toHaveBeenCalledTimes(2);
    });
  });

  describe('Check the run()', () => {
    test('it should be exit() called when run() is called with action "exit" and it was confirmed', async () => {
      expect.assertions(3);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: 'exit' });
      (prompts.exit as jest.Mock).mockRejectedValue('exit()');

      try {
        await level.run();
      } catch (err) {
        expect(err).toBe('exit()');

        expect(prompts.menu).toHaveBeenCalledTimes(1);
        expect(prompts.exit).toHaveBeenCalledTimes(1);
      }
    });

    test('it should be exit() called when run() is called with action "exit" and it was not confirmed', async () => {
      expect.assertions(3);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: 'exit' });
      (prompts.exit as jest.Mock).mockResolvedValue(undefined);

      const result = await level.run();

      expect(result).toBe(true);

      expect(prompts.menu).toHaveBeenCalledTimes(1);
      expect(prompts.exit).toHaveBeenCalledTimes(1);
    });

    test('it should be return false when run() is called with action "back"', async () => {
      expect.assertions(2);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: 'back' });

      const result = await level.run();

      expect(result).toBe(false);

      expect(prompts.menu).toHaveBeenCalledTimes(1);
    });

    test('it should be return false when run() is called with action "backToCollection"', async () => {
      expect.assertions(3);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: 'backToCollection' });

      try {
        await level.run();
      } catch (err) {
        expect(err).toBeInstanceOf(BackToCollectionError);
        expect(err.message).toBe('back');

        expect(prompts.menu).toHaveBeenCalledTimes(1);
      }
    });

    test('it should be creater() called when run() is called with action "write"', async () => {
      expect.assertions(6);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: 'write' });

      const result = await level.run();

      expect(result).toBe(true);

      expect(prompts.menu).toHaveBeenCalledTimes(1);
      expect(creater.exec).toHaveBeenCalledTimes(1);
      expect(creater.exec).toHaveBeenCalledWith({
        collections: [{ columns: [], idType: undefined, indexes: [], name: 'collectionName' }],
        idType: 'objectId',
        multipleConnection: false,
        path: 'path/to/group',
      });
      expect(storage.write).toHaveBeenCalledTimes(1);
      expect(storage.write).toHaveBeenCalledWith(false);
    });

    test('it should be nothing happens when run() is called with action "write" but the dataset is not group dataset', async () => {
      expect.assertions(4);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: 'write' });
      level.dataset = level.dataset.getCollections()[0];
      level.menu = new CollectionMenu(prompts);

      const result = await level.run();

      expect(result).toBe(true);

      expect(prompts.menu).toHaveBeenCalledTimes(1);
      expect(creater.exec).toHaveBeenCalledTimes(0);
      expect(storage.write).toHaveBeenCalledTimes(0);
    });

    test('it should be storage write() called when run() is called with action "save"', async () => {
      expect.assertions(4);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: 'save' });

      const result = await level.run();

      expect(result).toBe(true);

      expect(prompts.menu).toHaveBeenCalledTimes(1);
      expect(storage.write).toHaveBeenCalledTimes(1);
      expect(storage.write).toHaveBeenCalledWith();
    });

    test('it should be remove() called when run() is called with action "remove"', async () => {
      expect.assertions(5);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: 'remove' });
      (prompts.remove as jest.Mock).mockResolvedValue(true);

      expect(parent.getGroups().length).toBe(1);

      const result = await level.run();

      expect(result).toBe(false);

      expect(parent.getGroups().length).toBe(0);
      expect(prompts.menu).toHaveBeenCalledTimes(1);
      expect(prompts.remove).toHaveBeenCalledTimes(1);
    });

    test('it should be edit() called when run() is called with action "edit"', async () => {
      expect.assertions(3);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: 'edit' });

      const result = await level.run();

      expect(result).toBe(false);

      expect(prompts.menu).toHaveBeenCalledTimes(1);
      expect(level.promptEdit).toHaveBeenCalledTimes(1);
    });

    test.each<[choiceValueType<any>['action']]>([['create'], ['createColumn'], ['createIndex']])(
      'it should be create() called when run() is called with action "%s" and return a dataset',
      async (action) => {
        expect.assertions(6);

        (prompts.menu as jest.Mock).mockResolvedValue({ action });
        level.show = jest.fn().mockRejectedValue('show');

        try {
          await level.run();
        } catch (err) {
          expect(err).toBe('show');

          expect(prompts.menu).toHaveBeenCalledTimes(1);

          expect(level.show).toHaveBeenCalledTimes(1);
          expect(level.show).toHaveBeenCalledWith(expect.any(CollectionDataset));
          expect(level.promptCreate).toHaveBeenCalledTimes(1);
          expect(level.promptCreate).toHaveBeenCalledWith(prompts, dataset);
        }
      },
    );

    test.each<[choiceValueType<any>['action']]>([['create'], ['createColumn'], ['createIndex']])(
      'it should be create() called when run() is called with action "%s" and does not return a dataset',
      async (action) => {
        expect.assertions(5);

        (prompts.menu as jest.Mock).mockResolvedValue({ action });
        level.show = jest.fn().mockRejectedValue('show');
        level.promptCreate = jest.fn();

        const result = await level.run();

        expect(result).toBe(true);

        expect(prompts.menu).toHaveBeenCalledTimes(1);

        expect(level.show).toHaveBeenCalledTimes(0);
        expect(level.promptCreate).toHaveBeenCalledTimes(1);
        expect(level.promptCreate).toHaveBeenCalledWith(prompts, dataset);
      },
    );

    test('it should be show() called when run() is called without action and with data', async () => {
      expect.assertions(4);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: '', data: { withData: true } });
      level.show = jest.fn().mockRejectedValue('show');

      try {
        await level.run();
      } catch (err) {
        expect(err).toBe('show');

        expect(prompts.menu).toHaveBeenCalledTimes(1);

        expect(level.show).toHaveBeenCalledTimes(1);
        expect(level.show).toHaveBeenCalledWith({ withData: true });
      }
    });

    test('it should be show() called when run() is called without action and without data', async () => {
      (prompts.menu as jest.Mock).mockResolvedValue({ action: '' });
      level.show = jest.fn().mockRejectedValue('show');

      const result = await level.run();

      expect(result).toBe(true);

      expect(prompts.menu).toHaveBeenCalledTimes(1);

      expect(level.show).toHaveBeenCalledTimes(0);
    });

    test('it should be pressKey() called when run() is called with action "edit" and a error is thrown', async () => {
      expect.assertions(4);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: 'edit' });
      level.edit = jest.fn().mockRejectedValue(new Error('error message'));

      const result = await level.run();

      expect(result).toBe(true);

      expect(prompts.menu).toHaveBeenCalledTimes(1);
      expect(prompts.pressKey).toHaveBeenCalledTimes(1);
      expect(level.edit).toHaveBeenCalledTimes(1);
    });

    test('it should be ignore the error when run() is called with action "exit" and a error is thrown with message "cancel"', async () => {
      expect.assertions(4);

      (prompts.menu as jest.Mock).mockResolvedValue({ action: 'edit' });

      level.edit = jest.fn().mockRejectedValue(new CancelPromptError('cancel'));

      const result = await level.run();

      expect(result).toBe(true);

      expect(prompts.menu).toHaveBeenCalledTimes(1);
      expect(prompts.pressKey).toHaveBeenCalledTimes(0);
      expect(level.edit).toHaveBeenCalledTimes(1);
    });
  });
});
