jest.mock('../../prompts');
jest.mock('../dataset/collection');
jest.mock('../dataset/column');

import Prompts, { regexpName, regexpNameMessage } from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';

import { call, evaluation, getQuestions, validateName, whenType } from './columnMain';

describe('Check the prompts columnMain functions', () => {
  test('it should be return the answers when call() is called', async () => {
    const prompts = new (Prompts as any)();
    const collection = new (CollectionDataset as any)();
    const column1 = new (ColumnDataset as any)();
    const column2 = new (ColumnDataset as any)();

    (column1.getName as jest.Mock).mockReturnValue('c1');
    (column1.get as jest.Mock).mockReturnValue('string');
    (column2.getName as jest.Mock).mockReturnValue('c6');
    (column2.get as jest.Mock).mockReturnValue('object');

    (collection.getColumns as jest.Mock).mockReturnValue([column1, column2]);

    (prompts.call as jest.Mock).mockResolvedValue({ name: 'columnName', type: 'string' });

    const result = await call(prompts, collection, column1);

    expect(result).toEqual({ name: 'columnName', type: 'string' });

    expect(prompts.call).toHaveBeenCalledTimes(1);
    expect(prompts.call).toHaveBeenCalledWith([
      { default: 'c1', message: 'Column name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices: [
          { name: 'String', short: 'String', value: 'string' },
          { name: 'Number', short: 'Number', value: 'number' },
          { name: 'Date', short: 'Date', value: 'date' },
          { name: 'Boolean', short: 'Boolean', value: 'boolean' },
          { name: 'ObjectId', short: 'ObjectId', value: 'objectId' },
          { name: 'Decimal128', short: 'Decimal128', value: 'decimal' },
          { name: 'Buffer', short: 'Buffer', value: 'buffer' },
          { name: 'Mixed', short: 'Mixed', value: 'mixed' },
          { name: 'Array<Type>', short: 'Array<Type>', value: 'arrayType' },
          { name: 'Array<Object>', short: 'Array<Object>', value: 'array' },
          { name: 'Object', short: 'Object', value: 'object' },
          { name: 'Map', short: 'Map', value: 'map' },
          { name: '2dsphere', short: '2dsphere', value: '2dsphere' },
        ],
        default: 0,
        message: 'Choose a SchemaType:',
        name: 'type',
        type: 'list',
        when: expect.any(Function),
      },
    ]);

    expect(column1.getName).toHaveBeenCalledTimes(2);
    expect(column1.get).toHaveBeenCalledTimes(1);
    expect(column2.getName).toHaveBeenCalledTimes(1);
    expect(column2.get).toHaveBeenCalledTimes(0);

    expect(collection.getColumns).toHaveBeenCalledTimes(1);
  });

  test('it should be throw an error when call() is called and name is empty', async () => {
    const prompts = new (Prompts as any)();
    const collection = new (CollectionDataset as any)();
    const column1 = new (ColumnDataset as any)();
    const column2 = new (ColumnDataset as any)();

    (column1.getName as jest.Mock).mockReturnValue('c1');
    (column1.get as jest.Mock).mockReturnValue('string');
    (column2.getName as jest.Mock).mockReturnValue('c6');
    (column2.get as jest.Mock).mockReturnValue('object');

    (collection.getColumns as jest.Mock).mockReturnValue([column1, column2]);

    (prompts.call as jest.Mock).mockResolvedValue({ name: '' });

    expect.assertions(9);
    try {
      await call(prompts, collection, column1);
    } catch (err) {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toBe('cancel');

      expect(prompts.call).toHaveBeenCalledTimes(1);
      expect(prompts.call).toHaveBeenCalledWith([
        { default: 'c1', message: 'Column name:', name: 'name', type: 'input', validate: expect.any(Function) },
        {
          choices: [
            { name: 'String', short: 'String', value: 'string' },
            { name: 'Number', short: 'Number', value: 'number' },
            { name: 'Date', short: 'Date', value: 'date' },
            { name: 'Boolean', short: 'Boolean', value: 'boolean' },
            { name: 'ObjectId', short: 'ObjectId', value: 'objectId' },
            { name: 'Decimal128', short: 'Decimal128', value: 'decimal' },
            { name: 'Buffer', short: 'Buffer', value: 'buffer' },
            { name: 'Mixed', short: 'Mixed', value: 'mixed' },
            { name: 'Array<Type>', short: 'Array<Type>', value: 'arrayType' },
            { name: 'Array<Object>', short: 'Array<Object>', value: 'array' },
            { name: 'Object', short: 'Object', value: 'object' },
            { name: 'Map', short: 'Map', value: 'map' },
            { name: '2dsphere', short: '2dsphere', value: '2dsphere' },
          ],
          default: 0,
          message: 'Choose a SchemaType:',
          name: 'type',
          type: 'list',
          when: expect.any(Function),
        },
      ]);

      expect(column1.getName).toHaveBeenCalledTimes(2);
      expect(column1.get).toHaveBeenCalledTimes(1);
      expect(column2.getName).toHaveBeenCalledTimes(1);
      expect(column2.get).toHaveBeenCalledTimes(0);

      expect(collection.getColumns).toHaveBeenCalledTimes(1);
    }
  });

  test('it should be return the questions array then getQuestions() is called without column', () => {
    const collection = new (CollectionDataset as any)();
    const column1 = new (ColumnDataset as any)();
    const column2 = new (ColumnDataset as any)();

    (column1.getName as jest.Mock).mockReturnValue('c1');
    (column1.get as jest.Mock).mockReturnValue('string');
    (column2.getName as jest.Mock).mockReturnValue('c6');
    (column2.get as jest.Mock).mockReturnValue('object');

    (collection.getColumns as jest.Mock).mockReturnValue([column1, column2]);

    const result = getQuestions(collection);

    expect(result).toEqual([
      { default: undefined, message: 'Column name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices: [
          { name: 'String', short: 'String', value: 'string' },
          { name: 'Number', short: 'Number', value: 'number' },
          { name: 'Date', short: 'Date', value: 'date' },
          { name: 'Boolean', short: 'Boolean', value: 'boolean' },
          { name: 'ObjectId', short: 'ObjectId', value: 'objectId' },
          { name: 'Decimal128', short: 'Decimal128', value: 'decimal' },
          { name: 'Buffer', short: 'Buffer', value: 'buffer' },
          { name: 'Mixed', short: 'Mixed', value: 'mixed' },
          { name: 'Array<Type>', short: 'Array<Type>', value: 'arrayType' },
          { name: 'Array<Object>', short: 'Array<Object>', value: 'array' },
          { name: 'Object', short: 'Object', value: 'object' },
          { name: 'Map', short: 'Map', value: 'map' },
          { name: '2dsphere', short: '2dsphere', value: '2dsphere' },
        ],
        default: undefined,
        message: 'Choose a SchemaType:',
        name: 'type',
        type: 'list',
        when: expect.any(Function),
      },
    ]);

    expect(column1.getName).toHaveBeenCalledTimes(1);
    expect(column1.get).toHaveBeenCalledTimes(0);
    expect(column2.getName).toHaveBeenCalledTimes(1);
    expect(column2.get).toHaveBeenCalledTimes(0);

    expect(collection.getColumns).toHaveBeenCalledTimes(1);
  });

  test('it should be return the questions array then getQuestions() is called with column', () => {
    const collection = new (CollectionDataset as any)();
    const column1 = new (ColumnDataset as any)();
    const column2 = new (ColumnDataset as any)();

    (column1.getName as jest.Mock).mockReturnValue('c1');
    (column1.get as jest.Mock).mockReturnValue('string');
    (column2.getName as jest.Mock).mockReturnValue('c6');
    (column2.get as jest.Mock).mockReturnValue('object');

    (collection.getColumns as jest.Mock).mockReturnValue([column1, column2]);

    const result = getQuestions(collection, column2);

    expect(result).toEqual([
      { default: 'c6', message: 'Column name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices: [
          { name: 'String', short: 'String', value: 'string' },
          { name: 'Number', short: 'Number', value: 'number' },
          { name: 'Date', short: 'Date', value: 'date' },
          { name: 'Boolean', short: 'Boolean', value: 'boolean' },
          { name: 'ObjectId', short: 'ObjectId', value: 'objectId' },
          { name: 'Decimal128', short: 'Decimal128', value: 'decimal' },
          { name: 'Buffer', short: 'Buffer', value: 'buffer' },
          { name: 'Mixed', short: 'Mixed', value: 'mixed' },
          { name: 'Array<Type>', short: 'Array<Type>', value: 'arrayType' },
          { name: 'Array<Object>', short: 'Array<Object>', value: 'array' },
          { name: 'Object', short: 'Object', value: 'object' },
          { name: 'Map', short: 'Map', value: 'map' },
          { name: '2dsphere', short: '2dsphere', value: '2dsphere' },
        ],
        default: 10,
        message: 'Choose a SchemaType:',
        name: 'type',
        type: 'list',
        when: expect.any(Function),
      },
    ]);

    expect(column1.getName).toHaveBeenCalledTimes(1);
    expect(column1.get).toHaveBeenCalledTimes(0);
    expect(column2.getName).toHaveBeenCalledTimes(2);
    expect(column2.get).toHaveBeenCalledTimes(1);

    expect(collection.getColumns).toHaveBeenCalledTimes(1);
  });

  test('it should be return the questions array then getQuestions() is called and parent is a ColumnDataset', () => {
    const column1 = new (ColumnDataset as any)();
    const column2 = new (ColumnDataset as any)();

    (column1.getName as jest.Mock).mockReturnValue('c1');
    (column1.get as jest.Mock).mockReturnValue('string');
    (column1.getColumns as jest.Mock).mockReturnValue([column2]);
    (column2.getName as jest.Mock).mockReturnValue('c6');
    (column2.get as jest.Mock).mockReturnValue('object');

    const result = getQuestions(column1, column2);

    expect(result).toEqual([
      { default: 'c6', message: 'Column name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices: [
          { name: 'String', short: 'String', value: 'string' },
          { name: 'Number', short: 'Number', value: 'number' },
          { name: 'Date', short: 'Date', value: 'date' },
          { name: 'Boolean', short: 'Boolean', value: 'boolean' },
          { name: 'ObjectId', short: 'ObjectId', value: 'objectId' },
          { name: 'Decimal128', short: 'Decimal128', value: 'decimal' },
          { name: 'Buffer', short: 'Buffer', value: 'buffer' },
          { name: 'Mixed', short: 'Mixed', value: 'mixed' },
          { name: 'Array<Type>', short: 'Array<Type>', value: 'arrayType' },
          { name: 'Array<Object>', short: 'Array<Object>', value: 'array' },
          { name: 'Object', short: 'Object', value: 'object' },
          { name: 'Map', short: 'Map', value: 'map' },
          { name: '2dsphere', short: '2dsphere', value: '2dsphere' },
        ],
        default: 10,
        message: 'Choose a SchemaType:',
        name: 'type',
        type: 'list',
        when: expect.any(Function),
      },
    ]);

    expect(column1.getName).toHaveBeenCalledTimes(0);
    expect(column1.get).toHaveBeenCalledTimes(0);
    expect(column1.getColumns).toHaveBeenCalledTimes(1);
    expect(column2.getName).toHaveBeenCalledTimes(2);
    expect(column2.get).toHaveBeenCalledTimes(1);
  });

  test('it should be return the column when evaluation() is called', () => {
    const collection = new (CollectionDataset as any)();

    (collection.addColumn as jest.Mock).mockImplementation((a) => a);

    const closure = evaluation({ name: 'gName', type: 'array' }, collection, collection);

    expect(closure).toEqual(expect.any(Function));

    const result = closure();

    expect(result).toBeInstanceOf(ColumnDataset);

    expect(ColumnDataset).toHaveBeenCalledTimes(1);
    expect(ColumnDataset).toHaveBeenCalledWith({ name: 'gName', type: 'array' }, collection, collection);

    expect(collection.addColumn).toHaveBeenCalledTimes(1);
    expect(collection.addColumn).toHaveBeenCalledWith(result);
  });

  test('it should be return the column when evaluation() is called with column', () => {
    const collection = new (CollectionDataset as any)();
    const column = new (ColumnDataset as any)();

    const closure = evaluation({ name: 'cName', type: 'array' }, collection, collection);

    expect(closure).toEqual(expect.any(Function));

    const result = closure(column);

    expect(result).toBe(column);

    expect(ColumnDataset).toHaveBeenCalledTimes(1);
    expect(ColumnDataset).toHaveBeenCalledWith();

    expect(collection.addColumn).toHaveBeenCalledTimes(0);

    expect(column.setName).toHaveBeenCalledTimes(1);
    expect(column.setName).toHaveBeenCalledWith('cName');

    expect(column.set).toHaveBeenCalledTimes(1);
    expect(column.set).toHaveBeenCalledWith('type', 'array');
  });

  test.each<[string, string, string | boolean, boolean, string | undefined, number]>([
    ['true', 'name9  ', true, true, 'name9', 1],
    ['string', 'name9  ', regexpNameMessage, false, 'name9', 1],
    ['string', '_id', 'This column is created automatically!', true, undefined, 0],
    ['string', 'name2', 'A column with the name already exists!', true, undefined, 0],
  ])(
    'it should be return %s when validateName() is called (%p)',
    (_, name, expected, regexpReturn, regexpValue, mockTimes) => {
      expect.assertions(4 + mockTimes - 1);

      const mock = jest.fn().mockReturnValue(regexpReturn);

      regexpName.test = mock;

      const closure = validateName(['_id'], ['name2', 'name3'], 'name6');

      expect(closure).toEqual(expect.any(Function));

      const result = closure(name);

      expect(result).toEqual(expected);

      expect(mock).toHaveBeenCalledTimes(mockTimes);
      if (mockTimes) {
        expect(mock).toHaveBeenCalledWith(regexpValue);
      }
    },
  );

  test.each<[boolean, string]>([[true, 'name'], [true, '  name  '], [false, ''], [false, '    ']])(
    'it should be return %p when whenType() is called with "%s"',
    (expected, name) => {
      const closure = whenType();

      expect(closure).toEqual(expect.any(Function));

      const result = closure({ name });

      expect(result).toBe(expected);
    },
  );
});
