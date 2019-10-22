jest.mock('../../prompts');
jest.mock('../dataset/collection');
jest.mock('../dataset/column');
jest.mock('../dataset/index');

import Prompts, { regexpName, regexpNameMessage } from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import IndexDataset from '../dataset/index';

import { call, evaluation, getChoiceItem, getQuestions, validateName, whenColumns } from './indexMain';

describe('Check the prompts indexMain functions', () => {
  test('it should be return the answers when call() is called', async () => {
    const prompts = new (Prompts as any)();
    const collection = new (CollectionDataset as any)();
    const index1 = new (IndexDataset as any)();
    const index2 = new (IndexDataset as any)();
    const column1 = new (ColumnDataset as any)();
    const column2 = new (ColumnDataset as any)();

    (index1.getName as jest.Mock).mockReturnValue('oldName1');
    (index1.getColumns as jest.Mock).mockReturnValue({ c1: 1, c2: -1 });
    (index2.getName as jest.Mock).mockReturnValue('oldName2');
    (index2.getColumns as jest.Mock).mockReturnValue({ c6: 'text' });

    (column1.getFullname as jest.Mock).mockReturnValue('c1');
    (column1.get as jest.Mock).mockReturnValue('string');
    (column2.getFullname as jest.Mock).mockReturnValue('c6');
    (column2.get as jest.Mock).mockReturnValue('object');

    (collection.getIndexes as jest.Mock).mockReturnValue([index1, index2]);
    (collection.flatColumns as jest.Mock).mockReturnValue([column1, column2]);

    (prompts.call as jest.Mock).mockResolvedValue({ name: 'indexName', columns: ['c1', 'c6'] });

    const result = await call(prompts, collection, index1);

    expect(result).toEqual({ name: 'indexName', columns: ['c1', 'c6'] });

    expect(prompts.call).toHaveBeenCalledTimes(1);
    expect(prompts.call).toHaveBeenCalledWith([
      { default: 'oldName1', message: 'Index name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices: [
          { checked: true, disabled: false, name: 'c1', short: 'c1', value: 'c1' },
          { checked: false, disabled: true, name: 'c6', short: 'c6', value: 'c6' },
          { checked: false, disabled: false, name: 'createdAt', short: 'createdAt', value: 'createdAt' },
          { checked: false, disabled: false, name: 'updatedAt', short: 'updatedAt', value: 'updatedAt' },
          { checked: false, disabled: false, name: '_id', short: '_id', value: '_id' },
        ],
        message: 'Choose a columns:',
        name: 'columns',
        type: 'checkbox',
        when: expect.any(Function),
      },
    ]);

    expect(index1.getName).toHaveBeenCalledTimes(1);
    expect(index1.getColumns).toHaveBeenCalledTimes(1);
    expect(index2.getName).toHaveBeenCalledTimes(1);
    expect(index2.getColumns).toHaveBeenCalledTimes(0);

    expect(column1.getFullname).toHaveBeenCalledTimes(1);
    expect(column1.get).toHaveBeenCalledTimes(1);
    expect(column2.getFullname).toHaveBeenCalledTimes(1);
    expect(column2.get).toHaveBeenCalledTimes(1);

    expect(collection.getIndexes).toHaveBeenCalledTimes(1);
    expect(collection.flatColumns).toHaveBeenCalledTimes(1);
  });

  test.each([
    ['name is empty', { name: '', columns: ['c1', 'c6'] }],
    ['without columns', { name: 'iName', columns: [] }],
  ])('it should be throw an error when call() is called and %s', async (_, value) => {
    const prompts = new (Prompts as any)();
    const collection = new (CollectionDataset as any)();
    const index1 = new (IndexDataset as any)();
    const index2 = new (IndexDataset as any)();
    const column1 = new (ColumnDataset as any)();
    const column2 = new (ColumnDataset as any)();

    (index1.getName as jest.Mock).mockReturnValue('oldName1');
    (index1.getColumns as jest.Mock).mockReturnValue({ c1: 1, c2: -1 });
    (index2.getName as jest.Mock).mockReturnValue('oldName2');
    (index2.getColumns as jest.Mock).mockReturnValue({ c6: 'text' });

    (column1.getFullname as jest.Mock).mockReturnValue('c1');
    (column1.get as jest.Mock).mockReturnValue('string');
    (column2.getFullname as jest.Mock).mockReturnValue('c6');
    (column2.get as jest.Mock).mockReturnValue('object');

    (collection.getIndexes as jest.Mock).mockReturnValue([index1, index2]);
    (collection.flatColumns as jest.Mock).mockReturnValue([column1, column2]);

    (prompts.call as jest.Mock).mockResolvedValue(value);

    expect.assertions(14);
    try {
      await call(prompts, collection, index1);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('cancel');

      expect(prompts.call).toHaveBeenCalledTimes(1);
      expect(prompts.call).toHaveBeenCalledWith([
        { default: 'oldName1', message: 'Index name:', name: 'name', type: 'input', validate: expect.any(Function) },
        {
          choices: [
            { checked: true, disabled: false, name: 'c1', short: 'c1', value: 'c1' },
            { checked: false, disabled: true, name: 'c6', short: 'c6', value: 'c6' },
            { checked: false, disabled: false, name: 'createdAt', short: 'createdAt', value: 'createdAt' },
            { checked: false, disabled: false, name: 'updatedAt', short: 'updatedAt', value: 'updatedAt' },
            { checked: false, disabled: false, name: '_id', short: '_id', value: '_id' },
          ],
          message: 'Choose a columns:',
          name: 'columns',
          type: 'checkbox',
          when: expect.any(Function),
        },
      ]);

      expect(index1.getName).toHaveBeenCalledTimes(1);
      expect(index1.getColumns).toHaveBeenCalledTimes(1);
      expect(index2.getName).toHaveBeenCalledTimes(1);
      expect(index2.getColumns).toHaveBeenCalledTimes(0);

      expect(column1.getFullname).toHaveBeenCalledTimes(1);
      expect(column1.get).toHaveBeenCalledTimes(1);
      expect(column2.getFullname).toHaveBeenCalledTimes(1);
      expect(column2.get).toHaveBeenCalledTimes(1);

      expect(collection.getIndexes).toHaveBeenCalledTimes(1);
      expect(collection.flatColumns).toHaveBeenCalledTimes(1);
    }
  });

  test('it should be return the questions array then getQuestions() is called without index', () => {
    const collection = new (CollectionDataset as any)();
    const index1 = new (IndexDataset as any)();
    const index2 = new (IndexDataset as any)();
    const column1 = new (ColumnDataset as any)();
    const column2 = new (ColumnDataset as any)();

    (index1.getName as jest.Mock).mockReturnValue('oldName1');
    (index1.getColumns as jest.Mock).mockReturnValue({ c1: 1, c2: -1 });
    (index2.getName as jest.Mock).mockReturnValue('oldName2');
    (index2.getColumns as jest.Mock).mockReturnValue({ c6: 'text' });

    (column1.getFullname as jest.Mock).mockReturnValue('c1');
    (column1.get as jest.Mock).mockReturnValue('string');
    (column2.getFullname as jest.Mock).mockReturnValue('c6');
    (column2.get as jest.Mock).mockReturnValue('object');

    (collection.getIndexes as jest.Mock).mockReturnValue([index1, index2]);
    (collection.flatColumns as jest.Mock).mockReturnValue([column1, column2]);

    const result = getQuestions(collection);

    expect(result).toEqual([
      { message: 'Index name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices: [
          { checked: false, disabled: false, name: 'c1', short: 'c1', value: 'c1' },
          { checked: false, disabled: true, name: 'c6', short: 'c6', value: 'c6' },
          { checked: false, disabled: false, name: 'createdAt', short: 'createdAt', value: 'createdAt' },
          { checked: false, disabled: false, name: 'updatedAt', short: 'updatedAt', value: 'updatedAt' },
          { checked: false, disabled: false, name: '_id', short: '_id', value: '_id' },
        ],
        message: 'Choose a columns:',
        name: 'columns',
        type: 'checkbox',
        when: expect.any(Function),
      },
    ]);

    expect(index1.getName).toHaveBeenCalledTimes(1);
    expect(index1.getColumns).toHaveBeenCalledTimes(0);
    expect(index2.getName).toHaveBeenCalledTimes(1);
    expect(index2.getColumns).toHaveBeenCalledTimes(0);

    expect(column1.getFullname).toHaveBeenCalledTimes(1);
    expect(column1.get).toHaveBeenCalledTimes(1);
    expect(column2.getFullname).toHaveBeenCalledTimes(1);
    expect(column2.get).toHaveBeenCalledTimes(1);

    expect(collection.getIndexes).toHaveBeenCalledTimes(1);
    expect(collection.flatColumns).toHaveBeenCalledTimes(1);
  });

  test('it should be return the questions array then getQuestions() is called with index', () => {
    const collection = new (CollectionDataset as any)();
    const index1 = new (IndexDataset as any)();
    const index2 = new (IndexDataset as any)();
    const column1 = new (ColumnDataset as any)();
    const column2 = new (ColumnDataset as any)();

    (index1.getName as jest.Mock).mockReturnValue('oldName1');
    (index1.getColumns as jest.Mock).mockReturnValue({ c1: 1, c2: -1 });
    (index2.getName as jest.Mock).mockReturnValue('oldName2');
    (index2.getColumns as jest.Mock).mockReturnValue({ c6: 'text' });

    (column1.getFullname as jest.Mock).mockReturnValue('c1');
    (column1.get as jest.Mock).mockReturnValue('string');
    (column2.getFullname as jest.Mock).mockReturnValue('c6');
    (column2.get as jest.Mock).mockReturnValue('object');

    (collection.getIndexes as jest.Mock).mockReturnValue([index1, index2]);
    (collection.flatColumns as jest.Mock).mockReturnValue([column1, column2]);

    const result = getQuestions(collection, index1);

    expect(result).toEqual([
      { default: 'oldName1', message: 'Index name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices: [
          { checked: true, disabled: false, name: 'c1', short: 'c1', value: 'c1' },
          { checked: false, disabled: true, name: 'c6', short: 'c6', value: 'c6' },
          { checked: false, disabled: false, name: 'createdAt', short: 'createdAt', value: 'createdAt' },
          { checked: false, disabled: false, name: 'updatedAt', short: 'updatedAt', value: 'updatedAt' },
          { checked: false, disabled: false, name: '_id', short: '_id', value: '_id' },
        ],
        message: 'Choose a columns:',
        name: 'columns',
        type: 'checkbox',
        when: expect.any(Function),
      },
    ]);

    expect(index1.getName).toHaveBeenCalledTimes(1);
    expect(index1.getColumns).toHaveBeenCalledTimes(1);
    expect(index2.getName).toHaveBeenCalledTimes(1);
    expect(index2.getColumns).toHaveBeenCalledTimes(0);

    expect(column1.getFullname).toHaveBeenCalledTimes(1);
    expect(column1.get).toHaveBeenCalledTimes(1);
    expect(column2.getFullname).toHaveBeenCalledTimes(1);
    expect(column2.get).toHaveBeenCalledTimes(1);

    expect(collection.getIndexes).toHaveBeenCalledTimes(1);
    expect(collection.flatColumns).toHaveBeenCalledTimes(1);
  });

  test('it should be return the index when evaluation() is called', () => {
    const collection = new (CollectionDataset as any)();

    (collection.addIndex as jest.Mock).mockImplementation((a) => a);

    const closure = evaluation({ name: 'gName', columns: ['c4', 'c8'] }, collection);

    expect(closure).toEqual(expect.any(Function));

    const result = closure();

    expect(result).toBeInstanceOf(IndexDataset);

    expect(IndexDataset).toHaveBeenCalledTimes(1);
    expect(IndexDataset).toHaveBeenCalledWith({ columns: {}, name: 'gName', properties: {} }, collection);

    expect(collection.addIndex).toHaveBeenCalledTimes(1);
    expect(collection.addIndex).toHaveBeenCalledWith(result);
  });

  test('it should be return the index when evaluation() is called with index', () => {
    const collection = new (CollectionDataset as any)();
    const index = new (IndexDataset as any)();

    const closure = evaluation({ name: 'gName', columns: ['c4', 'c8'] }, collection);

    expect(closure).toEqual(expect.any(Function));

    const result = closure(index);

    expect(result).toBe(index);

    expect(IndexDataset).toHaveBeenCalledTimes(1);
    expect(IndexDataset).toHaveBeenCalledWith();

    expect(collection.addIndex).toHaveBeenCalledTimes(0);

    expect(index.setName).toHaveBeenCalledTimes(1);
    expect(index.setName).toHaveBeenCalledWith('gName');
  });

  test('it should be return a choice when getChoiceItem() is called [1]', () => {
    const result = getChoiceItem('iName', 'string', ['c1', 'c3']);

    expect(result).toEqual({ checked: false, disabled: false, name: 'iName', short: 'iName', value: 'iName' });
  });

  test('it should be return a choice when getChoiceItem() is called [2]', () => {
    const result = getChoiceItem('c3', 'object', ['c1', 'c3']);

    expect(result).toEqual({ checked: false, disabled: true, name: 'c3', short: 'c3', value: 'c3' });
  });

  test('it should be return a choice when getChoiceItem() is called [3]', () => {
    const result = getChoiceItem('c3', 'number', ['c1', 'c3']);

    expect(result).toEqual({ checked: true, disabled: false, name: 'c3', short: 'c3', value: 'c3' });
  });

  test.each<[string, string, string | boolean, boolean, string]>([
    ['true', 'name9  ', true, true, 'name9'],
    ['string', 'name9  ', regexpNameMessage, false, 'name9'],
    ['string', 'name2', 'A index with the name already exists!', true, 'name2'],
  ])('it should be return %s when validateName() is called (%p)', (_, name, expected, regexpReturn, regexpValue) => {
    const mock = jest.fn().mockReturnValue(regexpReturn);

    regexpName.test = mock;

    const closure = validateName(['name1', 'name2']);

    expect(closure).toEqual(expect.any(Function));

    const result = closure(name);

    expect(result).toEqual(expected);

    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith(regexpValue);
  });

  test.only.each<[boolean, string]>([[true, 'name'], [true, '  name  '], [false, ''], [false, '    ']])(
    'it should be return %p when whenColumns() is called with "%s"',
    (expected, name) => {
      const closure = whenColumns();

      expect(closure).toEqual(expect.any(Function));

      const result = closure({ name });

      expect(result).toBe(expected);
    },
  );
});
