jest.mock('../../prompts');
jest.mock('../../storage');
jest.mock('../../template/create');
jest.mock('../dataset/abstract');
jest.mock('../menu/abstract');

import Prompts from '../../prompts';
import Storage from '../../storage';
import Creater from '../../template/create';

import AbstractDataset from '../dataset/abstract';

import AbstractMenu from '../menu/abstract';

const mockDataset = jest.fn();

import AbstractLevel from './abstract';

import { choiceValueType, levelOptionsType } from '../../types';

/**
 *
 */
describe('Check the AbstractLevel class', () => {
  let abstract: any;
  let menu: any;
  let prompts: any;
  let options: levelOptionsType;

  /**
   *
   */
  beforeAll(() => {
    (AbstractDataset as jest.Mock).mockImplementation(() => ({
      getName: jest.fn(),
      remove: jest.fn(),
    }));

    (AbstractMenu as jest.Mock).mockImplementation(() => ({
      exec: jest.fn(),
    }));

    (Prompts as jest.Mock).mockImplementation(() => ({
      clear: jest.fn(),
      exit: jest.fn(),
      remove: jest.fn(),
      pressKey: jest.fn(),
    }));
  });

  /**
   *
   */
  beforeEach(() => {
    const storage = new (Storage as any)();
    const creater = new (Creater as any)();
    menu = new (AbstractMenu as any)();
    prompts = new (Prompts as any)();
    options = { prompts, storage, creater };

    abstract = new (AbstractLevel as any)(mockDataset, menu, options);
  });

  /**
   *
   */
  test('initialize the class', async () => {
    expect(abstract).toBeInstanceOf(AbstractLevel);

    expect(abstract.dataset).toBe(mockDataset);
    expect(abstract.menu).toBe(menu);
    expect(abstract.prompts).toBe(prompts);
    expect(abstract.options).toBe(options);
  });

  /**
   *
   */
  describe('Check the actions function', () => {
    /**
     *
     */
    test('it should be call the menu when showMenu() is called', async () => {
      const response: choiceValueType<any> = { action: 'create' };

      menu.exec.mockResolvedValue(response);

      const result = await abstract.showMenu();

      expect(result).toEqual({ action: 'create' });

      expect(menu.exec).toHaveBeenCalledTimes(1);
      expect(menu.exec).toHaveBeenCalledWith(mockDataset);
    });

    /**
     *
     */
    test('it should be call promptCreate function when create() is called', async () => {
      const dataset: AbstractDataset<any> = new (AbstractDataset as any)();

      abstract.promptCreate = jest.fn().mockResolvedValue(dataset);

      const result = await abstract.create('create');

      expect(result).toBe(dataset);

      expect(abstract.promptCreate).toHaveBeenCalledTimes(1);
      expect(abstract.promptCreate).toHaveBeenCalledWith(prompts, mockDataset);
    });

    /**
     *
     */
    test('it should be call promptEdit function when edit() is called', async () => {
      abstract.promptEdit = jest.fn();

      const parent: AbstractDataset<any> = new (AbstractDataset as any)();
      const dataset: AbstractDataset<any> = new (AbstractDataset as any)();
      dataset.getParent = jest.fn().mockReturnValue(parent);

      const result = await abstract.edit(dataset);

      expect(result).toBe(false);

      expect(abstract.promptEdit).toHaveBeenCalledTimes(1);
      expect(abstract.promptEdit).toHaveBeenCalledWith(prompts, parent, dataset);
    });

    /**
     *
     */
    test('it should be call promptEdit function when edit() is called without Parent', async () => {
      abstract.promptEdit = jest.fn();

      const dataset: AbstractDataset<any> = new (AbstractDataset as any)();
      dataset.getParent = jest.fn();

      expect.assertions(3);
      try {
        await abstract.edit(dataset);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Parent dataset is not defined');

        expect(abstract.promptEdit).toHaveBeenCalledTimes(0);
      }
    });

    /**
     *
     */
    test('it should be call remove prompts function when remove() is called with confirmation ', async () => {
      const dataset: AbstractDataset<any> = new (AbstractDataset as any)();

      (dataset.getName as jest.Mock).mockReturnValue('dataset name');
      prompts.remove.mockResolvedValue(true);

      const result = await abstract.remove(dataset);

      expect(result).toBe(false);

      expect(dataset.getName).toHaveBeenCalledTimes(1);
      expect(dataset.getName).toHaveBeenCalledWith();

      expect(dataset.remove).toHaveBeenCalledTimes(1);
      expect(dataset.remove).toHaveBeenCalledWith();

      expect(prompts.remove).toHaveBeenCalledTimes(1);
      expect(prompts.remove).toHaveBeenCalledWith('dataset name');
    });

    /**
     *
     */
    test('it should be call remove prompts function when remove() is called without confirmation ', async () => {
      const dataset: AbstractDataset<any> = new (AbstractDataset as any)();

      (dataset.getName as jest.Mock).mockReturnValue('dataset name');
      prompts.remove.mockResolvedValue(false);

      const result = await abstract.remove(dataset);

      expect(result).toBe(true);

      expect(dataset.getName).toHaveBeenCalledTimes(1);
      expect(dataset.getName).toHaveBeenCalledWith();

      expect(dataset.remove).toHaveBeenCalledTimes(0);

      expect(prompts.remove).toHaveBeenCalledTimes(1);
      expect(prompts.remove).toHaveBeenCalledWith('dataset name');
    });

    /**
     *
     */
    test('it should be throw an error when show() is called ', async () => {
      const dataset: AbstractDataset<any> = new (AbstractDataset as any)();

      expect.assertions(2);
      try {
        await abstract.show(dataset);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('Next menu level is not defined');
      }
    });

    /**
     *
     */
    test('it should be run() is called twice when exec() is called ', async () => {
      abstract.run = jest.fn();
      abstract.run.mockResolvedValueOnce(true);
      abstract.run.mockResolvedValueOnce(false);

      await abstract.exec();

      expect(abstract.run).toHaveBeenCalledTimes(2);
      expect(prompts.clear).toHaveBeenCalledTimes(2);
    });
  });

  /**
   *
   */
  describe('Check the run()', () => {
    let response: choiceValueType<any>;

    /**
     *
     */
    beforeEach(() => {
      abstract.showMenu = jest.fn();
      abstract.show = jest.fn();

      response = {};
    });

    /**
     *
     */
    test('it should be exit() called when run() is called with action "exit"', async () => {
      response.action = 'exit';

      abstract.showMenu.mockResolvedValue(response);

      const result = await abstract.run();

      expect(result).toBe(true);

      expect(abstract.showMenu).toHaveBeenCalledTimes(1);
      expect(prompts.exit).toHaveBeenCalledTimes(1);
    });

    /**
     *
     */
    test('it should be return false when run() is called with action "back"', async () => {
      response.action = 'back';

      abstract.showMenu.mockResolvedValue(response);

      const result = await abstract.run();

      expect(result).toBe(false);

      expect(abstract.showMenu).toHaveBeenCalledTimes(1);
    });

    /**
     *
     */
    test('it should be remove() called when run() is called with action "remove"', async () => {
      response.action = 'remove';

      abstract.showMenu.mockResolvedValue(response);
      abstract.remove = jest.fn().mockResolvedValue(true);

      const result = await abstract.run();

      expect(result).toBe(true);

      expect(abstract.showMenu).toHaveBeenCalledTimes(1);

      expect(abstract.remove).toHaveBeenCalledTimes(1);
      expect(abstract.remove).toHaveBeenCalledWith(mockDataset);
    });

    /**
     *
     */
    test('it should be edit() called when run() is called with action "edit"', async () => {
      response.action = 'edit';

      abstract.showMenu.mockResolvedValue(response);
      abstract.edit = jest.fn().mockResolvedValue(true);

      const result = await abstract.run();

      expect(result).toBe(true);

      expect(abstract.showMenu).toHaveBeenCalledTimes(1);

      expect(abstract.edit).toHaveBeenCalledTimes(1);
      expect(abstract.edit).toHaveBeenCalledWith(mockDataset);
    });

    const testCreateActions: Array<Array<choiceValueType<any>['action']>> = [
      ['create'],
      ['createColumn'],
      ['createIndex'],
    ];

    /**
     *
     */
    test.each(testCreateActions)(
      'it should be create() called when run() is called with action "%s" and return a dataset',
      async (action) => {
        response.action = action;

        const mock = jest.fn();

        abstract.showMenu.mockResolvedValue(response);
        abstract.create = jest.fn().mockResolvedValue(mock);

        const result = await abstract.run();

        expect(result).toBe(true);

        expect(abstract.showMenu).toHaveBeenCalledTimes(1);

        expect(abstract.create).toHaveBeenCalledTimes(1);
        expect(abstract.create).toHaveBeenCalledWith(action);

        expect(abstract.show).toHaveBeenCalledTimes(1);
        expect(abstract.show).toHaveBeenCalledWith(mock);
      },
    );

    /**
     *
     */
    test.each(testCreateActions)(
      'it should be create() called when run() is called with action "%s"',
      async (action) => {
        response.action = action;

        abstract.showMenu.mockResolvedValue(response);
        abstract.create = jest.fn().mockResolvedValue(undefined);

        const result = await abstract.run();

        expect(result).toBe(true);

        expect(abstract.showMenu).toHaveBeenCalledTimes(1);

        expect(abstract.create).toHaveBeenCalledTimes(1);
        expect(abstract.create).toHaveBeenCalledWith(action);

        expect(abstract.show).toHaveBeenCalledTimes(0);
      },
    );

    /**
     *
     */
    test('it should be show() called when run() is called without action and with data', async () => {
      const mock = jest.fn();

      response.data = mock;

      abstract.showMenu.mockResolvedValue(response);

      const result = await abstract.run();

      expect(result).toBe(true);

      expect(abstract.showMenu).toHaveBeenCalledTimes(1);

      expect(abstract.show).toHaveBeenCalledTimes(1);
      expect(abstract.show).toHaveBeenCalledWith(mock);
    });

    /**
     *
     */
    test('it should be show() called when run() is called without action and without data', async () => {
      abstract.showMenu.mockResolvedValue(response);

      const result = await abstract.run();

      expect(result).toBe(true);

      expect(abstract.showMenu).toHaveBeenCalledTimes(1);

      expect(abstract.show).toHaveBeenCalledTimes(0);
    });

    /**
     *
     */
    test('it should be pressKey() called when run() is called with action "exit" and a error is thrown', async () => {
      response.action = 'exit';

      abstract.showMenu.mockResolvedValue(response);
      (prompts.exit as jest.Mock).mockRejectedValue(new Error('Exit error'));

      const result = await abstract.run();

      expect(result).toBe(true);

      expect(abstract.showMenu).toHaveBeenCalledTimes(1);

      expect(prompts.exit).toHaveBeenCalledTimes(1);

      expect(prompts.pressKey).toHaveBeenCalledTimes(1);
      expect(prompts.pressKey).toHaveBeenCalledWith(['Exit error'], true);
    });

    /**
     *
     */
    test('it should be ignore the error when run() is called with action "exit" and a error is thrown with message "cancel"', async () => {
      response.action = 'exit';

      abstract.showMenu.mockResolvedValue(response);
      (prompts.exit as jest.Mock).mockRejectedValue(new Error('cancel'));

      const result = await abstract.run();

      expect(result).toBe(true);

      expect(abstract.showMenu).toHaveBeenCalledTimes(1);

      expect(prompts.exit).toHaveBeenCalledTimes(1);

      expect(prompts.pressKey).toHaveBeenCalledTimes(0);
    });

    /**
     *
     */
    test('it should be ignore the error when run() is called with action "exit" and a error is thrown without error object', async () => {
      response.action = 'exit';

      abstract.showMenu.mockResolvedValue(response);
      (prompts.exit as jest.Mock).mockRejectedValue('error wthout error object');

      expect.assertions(4);
      try {
        await abstract.run();
      } catch (err) {
        expect(err).toBe('error wthout error object');

        expect(abstract.showMenu).toHaveBeenCalledTimes(1);

        expect(prompts.exit).toHaveBeenCalledTimes(1);

        expect(prompts.pressKey).toHaveBeenCalledTimes(0);
      }
    });
  });
});
