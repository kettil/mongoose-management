jest.mock('../../prompts');
jest.mock('../../storage');
jest.mock('../../template/create');
jest.mock('../dataset/collection');
jest.mock('../dataset/column');
jest.mock('../dataset/index');
jest.mock('../menu/collection');
jest.mock('../prompts/collection');
jest.mock('../prompts/column');
jest.mock('../prompts/index');
jest.mock('./column');
jest.mock('./index');

import Prompts from '../../prompts';
import Storage from '../../storage';
import Creater from '../../template/create';

import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import IndexDataset from '../dataset/index';

import CollectionMenu from '../menu/collection';

import promptsCollection from '../prompts/collection';
import promptsColumn from '../prompts/column';
import promptsIndex from '../prompts/index';

import ColumnLevel from './column';
import IndexLevel from './index';

import CollectionLevel from './collection';

import { levelOptionsType } from '../../types';

/**
 *
 */
describe('Check the CollectionLevel class', () => {
  let level: any;
  let dataset: any;
  let prompts: any;
  let options: levelOptionsType;

  /**
   *
   */
  beforeEach(() => {
    const storage = new (Storage as any)();
    const creater = new (Creater as any)();
    prompts = new (Prompts as any)();
    dataset = new (CollectionDataset as any)();
    options = { prompts, storage, creater };

    level = new CollectionLevel(dataset, options);
  });

  /**
   *
   */
  test('initialize the class', () => {
    expect(level).toBeInstanceOf(CollectionLevel);

    expect(level.dataset).toBe(dataset);
    expect(level.menu).toBeInstanceOf(CollectionMenu);
    expect(level.prompts).toBe(prompts);
    expect(level.options).toBe(options);

    expect(level.promptCreate).toEqual(expect.any(Function));
    expect(level.promptEdit).toEqual(expect.any(Function));

    expect(level.promptEdit).toBe(promptsCollection);
  });

  /**
   *
   */
  test('it should be promptsIndex() called when create() is called with action "createIndex"', async () => {
    const mock = new (IndexDataset as any)();

    (promptsIndex as jest.Mock).mockResolvedValue(mock);

    const result = await level.create('createIndex');

    expect(result).toBe(undefined);

    expect(promptsIndex).toHaveBeenCalledTimes(1);
    expect(promptsIndex).toHaveBeenCalledWith(prompts, dataset);

    expect(promptsColumn).toHaveBeenCalledTimes(0);
  });

  /**
   *
   */
  test.each([['array'], ['object']])(
    'it should be promptsIndex() called when create() is called with action "createColumn" and type "%s"',
    async (action) => {
      const mock = new (ColumnDataset as any)();

      mock.get = jest.fn().mockReturnValue(action);

      (promptsColumn as jest.Mock).mockResolvedValue(mock);

      const result = await level.create('createColumn');

      expect(result).toBe(mock);

      expect(promptsIndex).toHaveBeenCalledTimes(0);

      expect(promptsColumn).toHaveBeenCalledTimes(1);
      expect(promptsColumn).toHaveBeenCalledWith(prompts, dataset);
    },
  );

  /**
   *
   */
  test('it should be promptsIndex() called when create() is called with action "createColumn" and type "string"', async () => {
    const mock = new (ColumnDataset as any)();

    mock.get = jest.fn().mockReturnValue('string');

    (promptsColumn as jest.Mock).mockResolvedValue(mock);

    const result = await level.create('createColumn');

    expect(result).toBe(undefined);

    expect(promptsIndex).toHaveBeenCalledTimes(0);

    expect(promptsColumn).toHaveBeenCalledTimes(1);
    expect(promptsColumn).toHaveBeenCalledWith(prompts, dataset);
  });

  /**
   *
   */
  test('it should be create IndexLevel when show() is called with an IndexDataset', async () => {
    const mock = new (IndexDataset as any)();

    await level.show(mock);

    expect(IndexLevel).toHaveBeenCalledTimes(1);
    expect(IndexLevel).toHaveBeenCalledWith(mock, options);

    expect(IndexLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(IndexLevel.prototype.exec).toHaveBeenCalledWith();

    expect(ColumnLevel).toHaveBeenCalledTimes(0);

    expect(ColumnLevel.prototype.exec).toHaveBeenCalledTimes(0);
  });

  /**
   *
   */
  test('it should be create ConsumerLevel when show() is called with a ColumnDataset', async () => {
    const mock = new (ColumnDataset as any)();

    await level.show(mock);

    expect(IndexLevel).toHaveBeenCalledTimes(0);

    expect(IndexLevel.prototype.exec).toHaveBeenCalledTimes(0);

    expect(ColumnLevel).toHaveBeenCalledTimes(1);
    expect(ColumnLevel).toHaveBeenCalledWith(mock, options);

    expect(ColumnLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(ColumnLevel.prototype.exec).toHaveBeenCalledWith();
  });

  /**
   *
   */
  test('it should be throw an error when show() is called without Dataset', async () => {
    expect.assertions(6);
    try {
      await level.show({});
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Unknown dataset instance');
    }

    expect(IndexLevel).toHaveBeenCalledTimes(0);

    expect(IndexLevel.prototype.exec).toHaveBeenCalledTimes(0);

    expect(ColumnLevel).toHaveBeenCalledTimes(0);

    expect(ColumnLevel.prototype.exec).toHaveBeenCalledTimes(0);
  });

  /**
   *
   */
  test('it should be throw an error when promptCreate() is called', async () => {
    expect.assertions(2);
    try {
      await level.promptCreate();
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('Creating action is not done in the abstract class');
    }
  });
});
