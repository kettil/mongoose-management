import CollectionDataset from './collection';
import GroupDataset from './group';
import IndexDataset from './index';

import ColumnDataset from './column';

import { dataColumnType } from '../../types';

describe('Check the ColumnDataset class', () => {
  let group: any;
  let collection: any;
  let dataset: any;
  let index: any;

  afterEach(() => {
    collection = undefined;
    dataset = undefined;
    group = undefined;
    index = undefined;
  });

  describe('Check a simple column structure (with index)', () => {
    beforeEach(() => {
      collection = new CollectionDataset(
        {
          name: 'collect',
          columns: [{ name: 'cName', type: 'string', required: true, enum: 'hello; morning' }],
          indexes: [{ name: 'cName_', properties: { unique: true }, columns: { cName: 1 }, readonly: true }],
        },
        jest.fn() as any,
      );
      collection.setReference();

      dataset = collection.getColumn('cName');
      index = collection.getIndex('cName_');
    });

    test('initialize the class', () => {
      expect(dataset).toBeInstanceOf(ColumnDataset);

      expect(dataset.parent).toBeInstanceOf(CollectionDataset);
      expect(dataset.columns).toEqual([]);
      expect(dataset.subTypes).toEqual([]);
      expect(dataset.index).toBeInstanceOf(IndexDataset);
      expect(dataset.index).toBe(index);
      expect(dataset.column).toEqual({ name: 'cName', required: true, type: 'string', enum: 'hello; morning' });
      expect(dataset.collection).toEqual(collection);
      expect(dataset.readonly).toEqual(false);

      expect(collection.getColumns().length).toBe(4);
      expect(collection.getIndexes().length).toBe(1);

      expect(index).toBeInstanceOf(IndexDataset);
    });

    test('it should be call setReference() from the columns when setReference() is called', () => {
      const mock0 = jest.fn();

      collection.getIndex = mock0;

      dataset.setReference();

      expect(mock0).toHaveBeenCalledTimes(1);
      expect(mock0).toHaveBeenCalledWith('cName_');
    });

    test('it should be return the name when getName() is called', () => {
      const name = dataset.getName();

      expect(name).toBe('cName');
    });

    test('it should be return the name when getName() is called with withBrackets is true', () => {
      const name = dataset.getName(true);

      expect(name).toBe('cName');
    });

    test('it should be change the name and the collection will be re-sorted when setName() is called', () => {
      expect(collection.getColumns()).toEqual([
        expect.any(ColumnDataset),
        dataset,
        expect.any(ColumnDataset),
        expect.any(ColumnDataset),
      ]);

      dataset.setName('new-cName');

      expect(dataset.column.name).toBe('new-cName');
      expect(collection.getColumns()).toEqual([
        expect.any(ColumnDataset),
        expect.any(ColumnDataset),
        dataset,
        expect.any(ColumnDataset),
      ]);

      expect(index.getName()).toBe('new-cName_');
      expect(index.getColumnsNormalize()).toEqual({ 'new-cName': 1 });
    });

    test.each<[string, boolean | undefined, boolean | undefined]>([
      ['cName', undefined, undefined],
      ['cName', true, true],
      ['cName', true, false],
      ['cName', false, true],
      ['cName', false, false],
    ])('it should be return "%s" when getFullname() is called [%p, %p]', (expected, args1, args2) => {
      const name = dataset.getFullname(args1, args2);

      expect(name).toBe(expected);
    });

    test('it should be return the value when get() is called', () => {
      const result = dataset.get('enum');

      expect(result).toBe('hello; morning');
    });

    test('it should be set value when set() is called', () => {
      dataset.set('default', 'Date.now()');

      expect(dataset.column.default).toBe('Date.now()');
    });

    const dataIsset: [boolean, keyof dataColumnType, any][] = [
      [true, 'required', true],
      [false, 'required', false],
      [false, 'required', undefined],
      [true, 'min', 0],
      [false, 'min', undefined],
      [true, 'enum', 'hello; morning'],
      [false, 'enum', undefined],
    ];

    test.each(dataIsset)(
      'it should be return %p when isset(%p) is called with init value "%p" and the value exists',
      (expected, opts, message) => {
        dataset.column[opts] = message;

        const result = dataset.isset(opts);

        expect(result).toBe(expected);
      },
    );

    test('it should be return false when isset(enum) is called with withEmptyString is false and string is empty', () => {
      dataset.set('enum', '');

      const result = dataset.isset('enum', false);

      expect(result).toBe(false);
    });

    test('it should be return true when isset(enum) is called with withEmptyString is true and string is empty', () => {
      dataset.set('enum', '');

      const result = dataset.isset('enum', true);

      expect(result).toBe(true);
    });

    test('it should be return the table name when getTableName() is called', () => {
      const name = dataset.getTableName();

      expect(name).toBe('cName');
    });

    test('it should be return the type when getTableType() is called with type is an object', () => {
      const name = dataset.getTableType();

      expect(name).toBe('string');
    });

    test('it should be a empty array when getSubTypes() is called without sub types', () => {
      const name = dataset.getSubTypes();

      expect(name).toEqual([]);
    });

    test('it should be return the index name when getIndexName() is called', () => {
      const name = dataset.getIndexName();

      expect(name).toEqual('cName_');
    });

    test('it should be return index when getIndex() is called ', () => {
      const result = dataset.getIndex();

      expect(result).toBe(index);
    });

    test.each([
      ['unique', true, true],
      ['unique', true, false],
      ['sparse', false, true],
      ['index', false, false],
    ])(
      'it should be return "%s" when getIndexType() is called  and the index has the following properties [%p, %p]',
      (expected, withUnique, withSparse) => {
        index.setProperty('unique', withUnique);
        index.setProperty('sparse', withSparse);

        const result = dataset.getIndexType();

        expect(result).toBe(expected);
      },
    );

    test('it should be return the index value when getIndexValue() is called ', () => {
      const result = dataset.getIndexValue();

      expect(result).toBe(1);
    });

    test('it should be return undefined when getIndexValue() is called and the index structure is faulty', () => {
      index.setColumns([]);

      expect.assertions(2);
      try {
        dataset.getIndexValue();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('The column index has less or more than 1 entry');
      }
    });

    test('it should be update the index when setIndex() is called', () => {
      expect(index.getProperty('unique')).toBe(true);
      expect(index.getProperty('sparse')).toBe(undefined);
      expect(index.getColumns()).toEqual([[dataset, 1]]);

      dataset.setIndex('hashed', 'sparse');

      expect(index.getProperty('unique')).toBe(false);
      expect(index.getProperty('sparse')).toBe(true);
      expect(index.getColumns()).toEqual([[dataset, 'hashed']]);
    });

    test('it should be remove the column index when removeIndex() is called', () => {
      expect(collection.getIndexes().length).toBe(1);

      dataset.removeIndex();

      expect(dataset.getIndex()).toBe(undefined);
      expect(collection.getIndexes().length).toBe(0);
    });

    test('it should be return false when isReadonly() is called and the column has not the readonly flag', () => {
      const result = dataset.isReadonly();

      expect(result).toBe(false);
    });

    test('it should be remove this column and the column index when remove() is called', () => {
      expect(collection.getColumns().length).toBe(4);
      expect(collection.getIndexes().length).toBe(1);

      dataset.remove();

      expect(collection.getColumns().length).toBe(3);
      expect(collection.getIndexes().length).toBe(0);
    });

    test('it should be return the collection when getCollection() is called', () => {
      const result = dataset.getCollection();

      expect(result).toBe(collection);
    });

    test('it should be return a data object when getObject() is called', () => {
      const result = dataset.getObject();

      expect(result).toEqual({
        enum: 'hello; morning',
        name: 'cName',
        required: true,
        type: 'string',
      });
    });
  });

  describe('Check a simple column structure (without index)', () => {
    beforeEach(() => {
      collection = new CollectionDataset(
        {
          name: 'collect',
          columns: [],
          indexes: [],
        },
        jest.fn() as any,
      );
      collection.setReference();

      dataset = collection.getColumn('_id');
    });

    test('initialize the class', () => {
      expect(dataset).toBeInstanceOf(ColumnDataset);

      expect(dataset.parent).toBeInstanceOf(CollectionDataset);
      expect(dataset.columns).toEqual([]);
      expect(dataset.subTypes).toEqual([]);
      expect(dataset.index).toBe(undefined);
      expect(dataset.column).toEqual({ name: '_id', type: 'objectId' });
      expect(dataset.collection).toEqual(collection);
      expect(dataset.readonly).toEqual(true);

      expect(collection.getColumns().length).toBe(3);
      expect(collection.getIndexes().length).toBe(0);
    });

    test('it should be change the name and the collection will be re-sorted when setName() is called', () => {
      expect(collection.getColumns()).toEqual([dataset, expect.any(ColumnDataset), expect.any(ColumnDataset)]);

      dataset.setName('_id2');

      expect(dataset.column.name).toBe('_id2');
      expect(collection.getColumns()).toEqual([dataset, expect.any(ColumnDataset), expect.any(ColumnDataset)]);
    });

    test('it should be return undefined when getIndexType() is called', () => {
      const result = dataset.getIndexType();

      expect(result).toBe(undefined);
    });

    test('it should be return undefined when getIndexValue() is called ', () => {
      const result = dataset.getIndexValue();

      expect(result).toBe(undefined);
    });

    test('it should be create the index when setIndex() is called', () => {
      expect(dataset.getIndex()).toBe(undefined);
      expect(collection.getIndexes().length).toBe(0);

      dataset.setIndex('hashed', 'unique');

      expect(dataset.getIndex()).toBeInstanceOf(IndexDataset);
      expect(dataset.getIndex().getProperty('unique')).toBe(true);
      expect(dataset.getIndex().getProperty('sparse')).toBe(false);
      expect(dataset.getIndex().getColumns()).toEqual([[dataset, 'hashed']]);
      expect(collection.getIndexes().length).toBe(1);
    });

    test('it should be remove the column index when removeIndex() is called', () => {
      expect(dataset.getIndex()).toBe(undefined);
      expect(collection.getIndexes().length).toBe(0);

      dataset.removeIndex();

      expect(dataset.getIndex()).toBe(undefined);
      expect(collection.getIndexes().length).toBe(0);
    });

    test('it should be return true when isReadonly() is called and the column has the readonly flag', () => {
      const result = dataset.isReadonly();

      expect(result).toBe(true);
    });
  });

  describe('Check a simple column structure (with populate)', () => {
    beforeEach(() => {
      group = new GroupDataset({ path: 'path/to', collections: [] }, jest.fn() as any);
      group.setReference();

      collection = new CollectionDataset(
        {
          name: 'collect',
          columns: [{ name: 'ref', type: 'objectId', populate: 'collect' }],
          indexes: [],
        },
        group,
      );
      group.addCollection(collection);

      dataset = collection.getColumn('ref');
    });

    test('initialize the class', () => {
      expect(dataset).toBeInstanceOf(ColumnDataset);

      expect(dataset.parent).toBeInstanceOf(CollectionDataset);
      expect(dataset.columns).toEqual([]);
      expect(dataset.subTypes).toEqual([]);
      expect(dataset.index).toBe(undefined);
      expect(dataset.populate).toBe(collection);
      expect(dataset.column).toEqual({ name: 'ref', type: 'objectId', populate: 'collect' });
      expect(dataset.collection).toEqual(collection);
      expect(dataset.readonly).toEqual(false);

      expect(collection.getColumns().length).toBe(4);
      expect(collection.getIndexes().length).toBe(0);
    });

    test('initialize the class with nested schemas', () => {
      const column = group.addCollection(
        new ColumnDataset({ name: 'ref2', type: 'objectId', populate: 'collect.ref' }, collection, collection),
      );

      expect(column).toBeInstanceOf(ColumnDataset);

      expect(column.parent).toBeInstanceOf(CollectionDataset);
      expect(column.columns).toEqual([]);
      expect(column.subTypes).toEqual([]);
      expect(column.index).toBe(undefined);
      expect(column.populate).toBe(dataset);
      expect(column.column).toEqual({ name: 'ref2', type: 'objectId', populate: 'collect.ref' });
      expect(column.collection).toEqual(collection);
      expect(column.readonly).toEqual(false);

      expect(collection.getColumns().length).toBe(4);
      expect(collection.getIndexes().length).toBe(0);
    });

    test('initialize the class with unknown nested schemas', () => {
      const column = group.addCollection(
        new ColumnDataset({ name: 'ref2', type: 'objectId', populate: 'collectWrong.ref' }, collection, collection),
      );

      expect(column).toBeInstanceOf(ColumnDataset);

      expect(column.parent).toBeInstanceOf(CollectionDataset);
      expect(column.columns).toEqual([]);
      expect(column.subTypes).toEqual([]);
      expect(column.index).toBe(undefined);
      expect(column.populate).toBe(undefined);
      expect(column.column).toEqual({ name: 'ref2', type: 'objectId', populate: 'collectWrong.ref' });
      expect(column.collection).toEqual(collection);
      expect(column.readonly).toEqual(false);

      expect(collection.getColumns().length).toBe(4);
      expect(collection.getIndexes().length).toBe(0);
    });

    test('it should be return CollectionDataset when getPopulate() is called', () => {
      const result = dataset.getPopulate();

      expect(result).toBeInstanceOf(CollectionDataset);
    });

    test('it should be return collection name when getPopulateName() is called with CollectionDataset', () => {
      const result = dataset.getPopulateName();

      expect(result).toBe('collect');
    });

    test('it should be return collection name when getPopulateName() is called with ColumnDataset', () => {
      dataset.setPopulate(dataset);

      const result = dataset.getPopulateName();

      expect(result).toBe('collect.ref');
    });

    test('it should be return collection name when getPopulateName() is called', () => {
      dataset.setPopulate();

      const result = dataset.getPopulateName();

      expect(result).toBe(undefined);
    });

    test('it should be remove the reference when setPopulate() is called', () => {
      dataset.setPopulate();

      expect(dataset.populate).toBe(undefined);
    });
  });

  describe('Check a simple column structure (without populate)', () => {
    beforeEach(() => {
      group = new GroupDataset({ path: 'path/to', collections: [] }, jest.fn() as any);
      group.setReference();

      collection = new CollectionDataset(
        {
          name: 'collect',
          columns: [{ name: 'ref', type: 'objectId' }],
          indexes: [],
        },
        group,
      );
      group.addCollection(collection);

      dataset = collection.getColumn('ref');
    });

    test('initialize the class', () => {
      expect(dataset).toBeInstanceOf(ColumnDataset);

      expect(dataset.parent).toBeInstanceOf(CollectionDataset);
      expect(dataset.columns).toEqual([]);
      expect(dataset.subTypes).toEqual([]);
      expect(dataset.index).toBe(undefined);
      expect(dataset.populate).toBe(undefined);
      expect(dataset.column).toEqual({ name: 'ref', type: 'objectId' });
      expect(dataset.collection).toEqual(collection);
      expect(dataset.readonly).toEqual(false);

      expect(collection.getColumns().length).toBe(4);
      expect(collection.getIndexes().length).toBe(0);
    });

    test('it should be return undefined when getPopulate() is called', () => {
      const result = dataset.getPopulate();

      expect(result).toBe(undefined);
    });

    test('it should be return undefined when getPopulateName() is called', () => {
      const result = dataset.getPopulateName();

      expect(result).toBe(undefined);
    });

    test('it should be remove the reference when setPopulate() is called with CollectionDataset', () => {
      dataset.setPopulate(collection);

      expect(dataset.populate).toBe(collection);
    });

    test('it should be remove the reference when setPopulate() is called with Column', () => {
      dataset.setPopulate(dataset);

      expect(dataset.populate).toBe(dataset);
    });
  });

  describe('Check a column structure with an object', () => {
    beforeEach(() => {
      collection = new CollectionDataset(
        {
          name: 'collect',
          columns: [
            {
              name: 'cName',
              type: 'object',
              required: true,
              subColumns: [
                { name: 'cSubName2', type: 'string', required: true },
                { name: 'cSubName1', type: 'number' },
              ],
            },
          ],
          indexes: [],
        },
        jest.fn() as any,
      );
      collection.setReference();

      dataset = collection.getColumn('cName');
    });

    test('initialize the class', () => {
      expect(dataset).toBeInstanceOf(ColumnDataset);

      expect(dataset.parent).toBeInstanceOf(CollectionDataset);
      expect(dataset.columns).toEqual([expect.any(ColumnDataset), expect.any(ColumnDataset)]);
      expect(dataset.subTypes).toEqual([]);
      expect(dataset.index).toBe(undefined);
      expect(dataset.column).toEqual({
        name: 'cName',
        required: true,
        subColumns: [
          { name: 'cSubName2', required: true, type: 'string' },
          { name: 'cSubName1', type: 'number' },
        ],
        type: 'object',
      });
      expect(dataset.collection).toEqual(collection);
      expect(dataset.readonly).toEqual(false);

      expect(collection.getColumns().length).toBe(4);
      expect(collection.getIndexes().length).toBe(0);
    });

    test('it should be call setReference() from the columns when setReference() is called', () => {
      const mock0 = jest.fn();
      const mock1 = jest.fn();

      collection.getIndex = mock0;
      dataset.getColumns().forEach((column: any) => (column.setReference = mock1));

      dataset.setReference();

      expect(mock0).toHaveBeenCalledTimes(1);
      expect(mock0).toHaveBeenCalledWith('cName_');
      expect(mock1).toHaveBeenCalledTimes(2);
    });

    test('it should be return the full table name when getTableName() is called', () => {
      const name = dataset.getColumn('cSubName2').getTableName();

      expect(name).toBe('cName.cSubName2');
    });

    test('it should be return the table name when getTableName() is called', () => {
      const name = dataset.getColumn('cSubName2').getTableName(dataset);

      expect(name).toBe('cSubName2');
    });

    test('it should be return a data object when getObject() is called', () => {
      const result = dataset.getObject();

      expect(result).toEqual({
        name: 'cName',
        required: true,
        subColumns: [
          { name: 'cSubName2', required: true, type: 'string' },
          { name: 'cSubName1', type: 'number' },
        ],
        subTypes: undefined,
        type: 'object',
      });
    });
  });

  describe('Check a column structure with an array', () => {
    beforeEach(() => {
      collection = new CollectionDataset(
        {
          name: 'collect',
          columns: [
            {
              name: 'cName',
              type: 'array',
              subColumns: [{ name: 'cSubSubName1', type: 'number', required: true }],
            },
          ],
          indexes: [],
        },
        jest.fn() as any,
      );
      collection.setReference();

      dataset = collection.getColumn('cName');
    });

    test('initialize the class', () => {
      expect(dataset).toBeInstanceOf(ColumnDataset);

      expect(dataset.parent).toBeInstanceOf(CollectionDataset);
      expect(dataset.columns).toEqual([expect.any(ColumnDataset)]);
      expect(dataset.subTypes).toEqual([]);
      expect(dataset.index).toBe(undefined);
      expect(dataset.column).toEqual({
        name: 'cName',
        subColumns: [{ name: 'cSubSubName1', required: true, type: 'number' }],
        type: 'array',
      });
      expect(dataset.collection).toEqual(collection);
      expect(dataset.readonly).toEqual(false);

      expect(collection.getColumns().length).toBe(4);
      expect(collection.getIndexes().length).toBe(0);
    });

    test('it should be call setReference() from the columns when setReference() is called', () => {
      const mock0 = jest.fn();
      const mock1 = jest.fn();

      collection.getIndex = mock0;
      dataset.getColumns().forEach((column: any) => (column.setReference = mock1));

      dataset.setReference();

      expect(mock0).toHaveBeenCalledTimes(1);
      expect(mock0).toHaveBeenCalledWith('cName_');
      expect(mock1).toHaveBeenCalledTimes(1);
    });

    test('it should be return the name when getName() is called', () => {
      const name = dataset.getName();

      expect(name).toBe('cName');
    });

    test('it should be return the name when getName() is called with withBrackets is true', () => {
      const name = dataset.getName(true);

      expect(name).toBe('cName[]');
    });

    test('it should be return the table name when getTableName() is called', () => {
      const name = dataset.getTableName(dataset, true);

      expect(name).toBe('cName[]');
    });

    test('it should be return the type when getTableType() is called with type is an object', () => {
      const name = dataset.getTableType();

      expect(name).toBe('[object]');
    });

    test('it should be return a data object when getObject() is called', () => {
      const result = dataset.getObject();

      expect(result).toEqual({
        name: 'cName',
        subColumns: [{ name: 'cSubSubName1', required: true, type: 'number' }],
        subTypes: undefined,
        type: 'array',
      });
    });
  });

  describe('Check a column structure with an arrayType', () => {
    beforeEach(() => {
      collection = new CollectionDataset(
        {
          name: 'collect',
          columns: [
            {
              name: 'cName',

              type: 'arrayType',
              subTypes: ['arrayType', 'boolean'],
            },
          ],
          indexes: [],
        },
        jest.fn() as any,
      );
      collection.setReference();

      dataset = collection.getColumn('cName');
    });

    test('initialize the class', () => {
      expect(dataset).toBeInstanceOf(ColumnDataset);

      expect(dataset.parent).toBeInstanceOf(CollectionDataset);
      expect(dataset.columns).toEqual([]);
      expect(dataset.subTypes).toEqual(['arrayType', 'boolean']);
      expect(dataset.index).toBe(undefined);
      expect(dataset.column).toEqual({ name: 'cName', subTypes: ['arrayType', 'boolean'], type: 'arrayType' });
      expect(dataset.collection).toEqual(collection);
      expect(dataset.readonly).toEqual(false);

      expect(collection.getColumns().length).toBe(4);
      expect(collection.getIndexes().length).toBe(0);
    });

    test('it should be return the type when getTableType() is called with type is an object', () => {
      const name = dataset.getTableType();

      expect(name).toBe('[[boolean]]');
    });

    test('it should be a array with sub types when getSubTypes() is called', () => {
      const result = dataset.getSubTypes();

      expect(result).toEqual(['arrayType', 'boolean']);
    });

    test('ot should be defined the sub types when setSubTypes() is called', () => {
      dataset.setSubTypes(['boolean']);

      const result = dataset.getSubTypes();

      expect(result).toEqual(['boolean']);
    });

    test('it should be return a data object when getObject() is called', () => {
      const result = dataset.getObject();

      expect(result).toEqual({
        name: 'cName',

        subTypes: ['arrayType', 'boolean'],
        type: 'arrayType',
      });
    });
  });
});
