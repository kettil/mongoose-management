jest.mock('../../prompts');
jest.mock('../../storage');
jest.mock('../../template/create');
jest.mock('../dataset/collection');
jest.mock('../dataset/column');
jest.mock('../dataset/index');
jest.mock('../menu/column');
jest.mock('../prompts/column');

import Prompts from '../../prompts';
import Storage from '../../storage';
import Creater from '../../template/create';

import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import IndexDataset from '../dataset/index';

import ColumnMenu from '../menu/column';

import promptsColumn from '../prompts/column';

import ColumnLevel from './column';

import { levelOptionsType } from '../../types';

/**
 *
 */
describe('Check the ColumnLevel class', () => {
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
    dataset = new (ColumnDataset as any)();
    options = { prompts, storage, creater };

    level = new ColumnLevel(dataset, options);
  });

  /**
   *
   */
  test('initialize the class', () => {
    expect(level).toBeInstanceOf(ColumnLevel);

    expect(level.dataset).toBe(dataset);
    expect(level.menu).toBeInstanceOf(ColumnMenu);
    expect(level.prompts).toBe(prompts);
    expect(level.options).toBe(options);

    expect(level.promptCreate).toEqual(expect.any(Function));
    expect(level.promptEdit).toEqual(expect.any(Function));

    expect(level.promptCreate).toBe(promptsColumn);
    expect(level.promptEdit).toBe(promptsColumn);
  });

  /**
   *
   */
  test.each([['array'], ['object']])(
    'it should be promptsColumn() called when create() is called with type "%s"',
    async (action) => {
      const mock = new (ColumnDataset as any)();

      mock.get = jest.fn().mockReturnValue(action);

      (promptsColumn as jest.Mock).mockResolvedValue(mock);

      const result = await level.create('create');

      expect(result).toBe(mock);

      expect(promptsColumn).toHaveBeenCalledTimes(1);
      expect(promptsColumn).toHaveBeenCalledWith(prompts, dataset);
    },
  );

  /**
   *
   */
  test('it should be promptsColumn() called when create() is called with type "string"', async () => {
    const mock = new (ColumnDataset as any)();

    mock.get = jest.fn().mockReturnValue('string');

    (promptsColumn as jest.Mock).mockResolvedValue(mock);

    const result = await level.create('create');

    expect(result).toBe(undefined);

    expect(promptsColumn).toHaveBeenCalledTimes(1);
    expect(promptsColumn).toHaveBeenCalledWith(prompts, dataset);
  });

  /**
   *
   */
  test('it should be remove dataset when remove() is called with confirmation', async () => {
    const mockColumn = new (ColumnDataset as any)();
    const mockIndex = new (IndexDataset as any)();
    const mockIndexOther1 = new (IndexDataset as any)();
    const mockIndexOther2 = new (IndexDataset as any)();
    const mockCollection = new (CollectionDataset as any)();

    mockColumn.getColumns.mockReturnValue([]);
    mockColumn.getName.mockReturnValue('subcolumn');
    mockColumn.getFullname.mockReturnValue('columns.subcolumn');
    mockColumn.getIndex.mockReturnValue(mockIndex);
    mockColumn.getCollection.mockReturnValue(mockCollection);

    mockCollection.getIndexes.mockReturnValue([mockIndexOther1, mockIndex, mockIndexOther2]);

    mockIndex.getColumns.mockReturnValue({ 'columns.subcolumn': 'text' });
    mockIndex.getName.mockReturnValue('main-index');
    mockIndexOther1.getColumns.mockReturnValue({ b: 1, c: -1 });
    mockIndexOther1.getName.mockReturnValue('other-index1');
    mockIndexOther2.getColumns.mockReturnValue({ a: 1, b: 1 });
    mockIndexOther2.getName.mockReturnValue('other-index2');

    prompts.remove.mockResolvedValue(true);

    const result = await level.remove(mockColumn);

    expect(result).toBe(false);

    expect(mockColumn.getColumns).toHaveBeenCalledTimes(1);
    expect(mockColumn.getName).toHaveBeenCalledTimes(1);
    expect(mockColumn.getFullname).toHaveBeenCalledTimes(1);
    expect(mockColumn.getFullname).toHaveBeenCalledWith(false, false);
    expect(mockColumn.getIndex).toHaveBeenCalledTimes(1);
    expect(mockColumn.getCollection).toHaveBeenCalledTimes(1);
    expect(mockColumn.remove).toHaveBeenCalledTimes(1);

    expect(mockCollection.getIndexes).toHaveBeenCalledTimes(1);

    expect(mockIndex.getColumns).toHaveBeenCalledTimes(0);
    expect(mockIndex.getName).toHaveBeenCalledTimes(0);

    expect(mockIndexOther1.getColumns).toHaveBeenCalledTimes(1);
    expect(mockIndexOther1.getName).toHaveBeenCalledTimes(0);

    expect(mockIndexOther2.getColumns).toHaveBeenCalledTimes(1);
    expect(mockIndexOther2.getName).toHaveBeenCalledTimes(0);

    expect(prompts.remove).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be not remove dataset when remove() is called without confirmation', async () => {
    const mockColumn = new (ColumnDataset as any)();
    const mockIndex = new (IndexDataset as any)();
    const mockIndexOther1 = new (IndexDataset as any)();
    const mockIndexOther2 = new (IndexDataset as any)();
    const mockCollection = new (CollectionDataset as any)();

    mockColumn.getColumns.mockReturnValue([]);
    mockColumn.getName.mockReturnValue('subcolumn');
    mockColumn.getFullname.mockReturnValue('columns.subcolumn');
    mockColumn.getIndex.mockReturnValue(mockIndex);
    mockColumn.getCollection.mockReturnValue(mockCollection);

    mockCollection.getIndexes.mockReturnValue([mockIndexOther1, mockIndex, mockIndexOther2]);

    mockIndex.getColumns.mockReturnValue({ 'columns.subcolumn': 'text' });
    mockIndex.getName.mockReturnValue('main-index');
    mockIndexOther1.getColumns.mockReturnValue({ b: 1, c: -1 });
    mockIndexOther1.getName.mockReturnValue('other-index1');
    mockIndexOther2.getColumns.mockReturnValue({ a: 1, b: 1 });
    mockIndexOther2.getName.mockReturnValue('other-index2');

    prompts.remove.mockResolvedValue(false);

    const result = await level.remove(mockColumn);

    expect(result).toBe(true);

    expect(mockColumn.getColumns).toHaveBeenCalledTimes(1);
    expect(mockColumn.getName).toHaveBeenCalledTimes(1);
    expect(mockColumn.getFullname).toHaveBeenCalledTimes(1);
    expect(mockColumn.getFullname).toHaveBeenCalledWith(false, false);
    expect(mockColumn.getIndex).toHaveBeenCalledTimes(1);
    expect(mockColumn.getCollection).toHaveBeenCalledTimes(1);
    expect(mockColumn.remove).toHaveBeenCalledTimes(0);

    expect(mockCollection.getIndexes).toHaveBeenCalledTimes(1);

    expect(mockIndex.getColumns).toHaveBeenCalledTimes(0);
    expect(mockIndex.getName).toHaveBeenCalledTimes(0);

    expect(mockIndexOther1.getColumns).toHaveBeenCalledTimes(1);
    expect(mockIndexOther1.getName).toHaveBeenCalledTimes(0);

    expect(mockIndexOther2.getColumns).toHaveBeenCalledTimes(1);
    expect(mockIndexOther2.getName).toHaveBeenCalledTimes(0);

    expect(prompts.remove).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be throw an error when remove() is called with subcolumns', async () => {
    const mock = new (ColumnDataset as any)();
    const mockSubColumn1 = new (ColumnDataset as any)();
    const mockSubColumn2 = new (ColumnDataset as any)();

    mock.getColumns.mockReturnValue([mockSubColumn1, mockSubColumn2]);

    expect.assertions(2);
    try {
      await level.remove(mock);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('There are still subcolumns. These must be deleted first!');
    }
  });

  /**
   *
   */
  test('it should be throw an error when remove() is called with indexes found', async () => {
    const mockColumn = new (ColumnDataset as any)();
    const mockIndex = new (IndexDataset as any)();
    const mockIndexOther1 = new (IndexDataset as any)();
    const mockIndexOther2 = new (IndexDataset as any)();
    const mockCollection = new (CollectionDataset as any)();

    mockColumn.getColumns.mockReturnValue([]);
    mockColumn.getName.mockReturnValue('subcolumn');
    mockColumn.getFullname.mockReturnValue('columns.subcolumn');
    mockColumn.getIndex.mockReturnValue(mockIndex);
    mockColumn.getCollection.mockReturnValue(mockCollection);

    mockCollection.getIndexes.mockReturnValue([mockIndexOther1, mockIndex, mockIndexOther2]);

    mockIndex.getColumns.mockReturnValue({ 'columns.subcolumn': 'text' });
    mockIndex.getName.mockReturnValue('main-index');
    mockIndexOther1.getColumns.mockReturnValue({ b: 1, c: -1 });
    mockIndexOther1.getName.mockReturnValue('other-index1');
    mockIndexOther2.getColumns.mockReturnValue({ 'columns.subcolumn': 1, b: 1 });
    mockIndexOther2.getName.mockReturnValue('other-index2');

    expect.assertions(17);
    try {
      await level.remove(mockColumn);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe(
        [
          'Indexes still exist for the column. These must be deleted first!',
          '',
          'The following indexes contain the column:',
          '- other-index2',
        ].join('\n'),
      );

      expect(mockColumn.getColumns).toHaveBeenCalledTimes(1);
      expect(mockColumn.getName).toHaveBeenCalledTimes(0);
      expect(mockColumn.getFullname).toHaveBeenCalledTimes(1);
      expect(mockColumn.getFullname).toHaveBeenCalledWith(false, false);
      expect(mockColumn.getIndex).toHaveBeenCalledTimes(1);
      expect(mockColumn.getCollection).toHaveBeenCalledTimes(1);
      expect(mockColumn.remove).toHaveBeenCalledTimes(0);

      expect(mockCollection.getIndexes).toHaveBeenCalledTimes(1);

      expect(mockIndex.getColumns).toHaveBeenCalledTimes(0);
      expect(mockIndex.getName).toHaveBeenCalledTimes(0);

      expect(mockIndexOther1.getColumns).toHaveBeenCalledTimes(1);
      expect(mockIndexOther1.getName).toHaveBeenCalledTimes(0);

      expect(mockIndexOther2.getColumns).toHaveBeenCalledTimes(1);
      expect(mockIndexOther2.getName).toHaveBeenCalledTimes(1);

      expect(prompts.remove).toHaveBeenCalledTimes(0);
    }
  });

  /**
   *
   */
  test('it should be create ConsumerLevel when show() is called', async () => {
    const mock = new (ColumnDataset as any)();

    ColumnLevel.prototype.exec = jest.fn();

    await level.show(mock);

    expect(ColumnLevel.prototype.exec).toHaveBeenCalledTimes(1);
    expect(ColumnLevel.prototype.exec).toHaveBeenCalledWith();
  });
});
