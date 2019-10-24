import Prompts, { regexpNameMessage } from '../../prompts';
import CollectionDataset from '../dataset/collection';
import ColumnDataset from '../dataset/column';
import IndexDataset from '../dataset/index';
import { CancelPromptError } from '../errors';

import { call, evaluation, getChoiceItem, getQuestions, validateName, whenColumns } from './indexMain';

const mockCall = jest.fn();

let column1: ColumnDataset;
let column2: ColumnDataset;

describe('Check the prompts indexMain functions', () => {
  let prompts: Prompts;
  let collection: CollectionDataset;
  let index: IndexDataset;

  beforeEach(() => {
    prompts = { call: mockCall } as any;

    collection = new CollectionDataset(
      {
        name: 'collectionName',
        columns: [{ name: 'column1', type: 'string' }, { name: 'column2', type: 'string' }],
        indexes: [{ name: 'index1', columns: { column1: 1 }, properties: {} }],
      },
      jest.fn() as any,
    );
    collection.setReference();

    column1 = collection.getColumn('column1')!;
    column2 = collection.getColumn('column2')!;

    index = collection.getIndex('index1')!;
  });

  test('it should be return the answers when call() is called', async () => {
    expect.assertions(6);

    mockCall.mockImplementation((questions) => {
      expect(questions).toMatchSnapshot();

      return { name: 'newIndexName', columns: [column1, column2] };
    });

    expect(column1).toBeInstanceOf(ColumnDataset);
    expect(column2).toBeInstanceOf(ColumnDataset);

    expect(index).toBeInstanceOf(IndexDataset);

    const result = await call(prompts, collection);

    expect(result).toEqual({ name: 'newIndexName', columns: [column1, column2] });
    expect(prompts.call).toHaveBeenCalledTimes(1);
  });

  test.each<[string, object]>([
    ['name is empty', { name: '', columns: [column1, column2] }],
    ['without columns', { name: 'newIndexName', columns: [] }],
  ])('it should be throw an error when call() is called and %s', async (_, value) => {
    expect.assertions(7);

    mockCall.mockImplementation((questions) => {
      expect(questions).toMatchSnapshot();

      return { ...value };
    });

    expect(column1).toBeInstanceOf(ColumnDataset);
    expect(column2).toBeInstanceOf(ColumnDataset);

    expect(index).toBeInstanceOf(IndexDataset);

    try {
      await call(prompts, collection);
    } catch (err) {
      expect(err).toBeInstanceOf(CancelPromptError);
      expect(err.message).toBe('cancel');

      expect(prompts.call).toHaveBeenCalledTimes(1);
    }
  });

  test('it should be return the questions array then getQuestions() is called without index', () => {
    const result = getQuestions(collection);

    expect(result).toEqual([
      { default: undefined, message: 'Index name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices: [
          { checked: false, disabled: false, name: '_id', short: '_id', value: expect.any(ColumnDataset) },
          { checked: false, disabled: false, name: 'column1', short: 'column1', value: expect.any(ColumnDataset) },
          { checked: false, disabled: false, name: 'column2', short: 'column2', value: expect.any(ColumnDataset) },
          { checked: false, disabled: false, name: 'createdAt', short: 'createdAt', value: expect.any(ColumnDataset) },
          { checked: false, disabled: false, name: 'updatedAt', short: 'updatedAt', value: expect.any(ColumnDataset) },
        ],
        message: 'Choose a columns:',
        name: 'columns',
        type: 'checkbox',
        when: expect.any(Function),
      },
    ]);
  });

  test('it should be return the questions array then getQuestions() is called with index', () => {
    expect(index).toBeInstanceOf(IndexDataset);

    const result = getQuestions(collection, index);

    expect(result).toEqual([
      { default: 'index1', message: 'Index name:', name: 'name', type: 'input', validate: expect.any(Function) },
      {
        choices: [
          { checked: false, disabled: false, name: '_id', short: '_id', value: expect.any(ColumnDataset) },
          { checked: true, disabled: false, name: 'column1', short: 'column1', value: expect.any(ColumnDataset) },
          { checked: false, disabled: false, name: 'column2', short: 'column2', value: expect.any(ColumnDataset) },
          { checked: false, disabled: false, name: 'createdAt', short: 'createdAt', value: expect.any(ColumnDataset) },
          { checked: false, disabled: false, name: 'updatedAt', short: 'updatedAt', value: expect.any(ColumnDataset) },
        ],
        message: 'Choose a columns:',
        name: 'columns',
        type: 'checkbox',
        when: expect.any(Function),
      },
    ]);
  });

  test('it should be return the index when evaluation() is called without index', () => {
    expect(column1).toBeInstanceOf(ColumnDataset);
    expect(column2).toBeInstanceOf(ColumnDataset);

    const closure = evaluation({ name: 'newIndexName', columns: [column1, column2] }, collection);

    expect(closure).toEqual(expect.any(Function));

    const result = closure();

    expect(result).toBeInstanceOf(IndexDataset);
    expect(collection.getObject()).toEqual({
      columns: [
        { name: 'column1', subColumns: undefined, subTypes: undefined, type: 'string' },
        { name: 'column2', subColumns: undefined, subTypes: undefined, type: 'string' },
      ],
      indexes: [
        { columns: { column1: 1 }, name: 'index1', properties: {} },
        { columns: {}, name: 'newIndexName', properties: {} },
      ],
      name: 'collectionName',
    });
  });

  test('it should be return the index when evaluation() is called with index', () => {
    expect(column1).toBeInstanceOf(ColumnDataset);
    expect(column2).toBeInstanceOf(ColumnDataset);
    expect(index).toBeInstanceOf(IndexDataset);

    const closure = evaluation({ name: 'newIndexName', columns: [column1, column2] }, collection);

    expect(closure).toEqual(expect.any(Function));

    const result = closure(index);

    expect(result).toBeInstanceOf(IndexDataset);
    expect(result).toBe(index);
    expect(collection.getObject()).toEqual({
      columns: [
        { name: 'column1', subColumns: undefined, subTypes: undefined, type: 'string' },
        { name: 'column2', subColumns: undefined, subTypes: undefined, type: 'string' },
      ],
      indexes: [{ columns: { column1: 1 }, name: 'newIndexName', properties: {} }],
      name: 'collectionName',
    });
  });

  test('it should be return a choice when getChoiceItem() is called ', () => {
    expect(column1).toBeInstanceOf(ColumnDataset);

    const result = getChoiceItem(column1, ['column1', 'column2']);

    expect(result).toEqual({ checked: true, disabled: false, name: 'column1', short: 'column1', value: column1 });
  });

  test('it should be return a choice when getChoiceItem() is called and cannot find the column', () => {
    expect(column1).toBeInstanceOf(ColumnDataset);

    const result = getChoiceItem(column1, ['column2', 'column3']);

    expect(result).toEqual({ checked: false, disabled: false, name: 'column1', short: 'column1', value: column1 });
  });

  test('it should be return a choice when getChoiceItem() is called with special type', () => {
    expect(column1).toBeInstanceOf(ColumnDataset);

    column1.set('type', 'object');

    const result = getChoiceItem(column1, ['column1', 'column2']);

    expect(result).toEqual({ checked: false, disabled: true, name: 'column1', short: 'column1', value: column1 });
  });

  test.each<[string, string, string | boolean]>([
    ['true', 'name9  ', true],
    ['string', '_name9  ', regexpNameMessage],
    ['string', 'name2', 'A index with the name already exists!'],
  ])('it should be return %s when validateName() is called (%p)', (_, name, expected) => {
    const closure = validateName(['name1', 'name2']);

    expect(closure).toBeInstanceOf(Function);

    const result = closure(name);

    expect(result).toEqual(expected);
  });

  test.each<[boolean, string]>([[true, 'name'], [true, '  name  '], [false, ''], [false, '    ']])(
    'it should be return %p when whenColumns() is called with "%s"',
    (expected, name) => {
      const closure = whenColumns();

      expect(closure).toEqual(expect.any(Function));

      const result = closure({ name });

      expect(result).toBe(expected);
    },
  );
});
