jest.mock('./collection');
jest.mock('./index');

import CollectionDataset from './collection';
import IndexDataset from './index';

import ColumnDataset from './column';

import { dataColumnType, schemaNormalType, schemaType } from '../../types';

/**
 *
 */
describe('Check the CollectionDataset class', () => {
  let dataset: any;
  let parent: any;
  let data: dataColumnType;

  /**
   *
   */
  beforeEach(() => {
    data = {
      name: 'cName',
      type: 'object',
      required: true,
      subColumns: [
        { name: 'cSubName1', type: 'string', required: true },
        { name: 'cSubName2', type: 'arrayType', subTypes: ['arrayType', 'boolean'] },
        {
          name: 'cSubName3',
          type: 'array',
          subColumns: [{ name: 'cSubSubName1', type: 'number', required: true }],
        },
      ],
    };

    parent = new (CollectionDataset as any)();

    dataset = new ColumnDataset(data, parent, parent);
  });

  /**
   *
   */
  test('initialize the class [1]', async () => {
    expect(dataset).toBeInstanceOf(ColumnDataset);

    expect(dataset.parent).toBeInstanceOf(CollectionDataset);
    expect(dataset.data).toEqual({
      name: 'cName',
      type: 'object',
      required: true,
      subColumns: [
        { name: 'cSubName1', type: 'string', required: true },
        { name: 'cSubName2', type: 'arrayType', subTypes: ['arrayType', 'boolean'] },
        { name: 'cSubName3', type: 'array', subColumns: [{ name: 'cSubSubName1', type: 'number', required: true }] },
      ],
    });
    expect(dataset.columns).toEqual([expect.any(ColumnDataset), expect.any(ColumnDataset), expect.any(ColumnDataset)]);
    expect(dataset.subTypes).toEqual([]);
  });

  /**
   *
   */
  test('initialize the class [2]', async () => {
    dataset = new ColumnDataset({ ...data, subColumns: undefined, type: 'string', required: false }, parent, parent);

    expect(dataset).toBeInstanceOf(ColumnDataset);

    expect(dataset.parent).toBeInstanceOf(CollectionDataset);
    expect(dataset.data).toEqual({ name: 'cName', type: 'string', required: false });
    expect(dataset.columns).toEqual([]);
    expect(dataset.subTypes).toEqual([]);
  });

  /**
   *
   */
  test('initialize the class [3]', async () => {
    const subTypes: schemaNormalType[] = ['arrayType', 'string'];

    dataset = new ColumnDataset(
      { ...data, type: 'arrayType', subColumns: undefined, subTypes, required: undefined },
      parent,
      parent,
    );

    expect(dataset).toBeInstanceOf(ColumnDataset);

    expect(dataset.parent).toBeInstanceOf(CollectionDataset);
    expect(dataset.data).toEqual({
      name: 'cName',
      type: 'arrayType',
      subTypes: ['arrayType', 'string'],
    });
    expect(dataset.columns).toEqual([]);
    expect(dataset.subTypes).toEqual(['arrayType', 'string']);
  });

  /**
   *
   */
  test('it should be return the name when getName() is called', () => {
    const name = dataset.getName();

    expect(name).toBe('cName');
  });

  /**
   *
   */
  test('it should be return the name when getName() is called with type ”array"', () => {
    dataset.data.type = 'array';
    const name = dataset.getName(true);

    expect(name).toBe('cName[]');
  });

  /**
   *
   */
  test('it should be change the name and the collection will be re-sorted when setName() is called', () => {
    dataset.setName('new-cName');

    expect(dataset.data.name).toBe('new-cName');

    expect(parent.sortColumns).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  describe.each<[schemaType, string]>([['array', '[]'], ['object', ''], ['string', ''], ['number', '']])(
    'Check the getFullname()',
    (type, extend) => {
      /**
       *
       */
      test.each<[string, boolean | undefined, boolean | undefined]>([
        ['cName', undefined, undefined],
        ['cName' + extend, true, true],
        ['cName', true, false],
        ['cName', false, true],
        ['cName', false, false],
      ])(
        `it should be return "%s" when getFullname() is called with type "${type}" [%p, %p]`,
        (expected, args1, args2) => {
          dataset.data.type = type;

          const name = dataset.getFullname(args1, args2);

          expect(name).toBe(expected);
        },
      );
    },
  );

  /**
   *
   */
  describe.each<[schemaType]>([['array'], ['object']])('Check the getFullname() from subcolumn', (type) => {
    /**
     *
     */
    test.each<[string, boolean | undefined, boolean | undefined]>([
      ['cName.cSubName1', undefined, undefined],
      ['cName.cSubName1[]', true, true],
      ['cName.cSubName1', true, false],
      ['cName.cSubName1', false, true],
      ['cName.cSubName1', false, false],
    ])(
      `it should be return "%s" when getFullname() is called with type "${type}" [%p, %p]`,
      (expected, args1, args2) => {
        dataset.type = type;
        dataset.getColumn('cSubName1').data.type = 'array';

        const name = dataset.getColumn('cSubName1').getFullname(args1, args2);

        expect(name).toBe(expected);
      },
    );
  });

  /**
   *
   */
  describe('Check the properties()', () => {
    /**
     *
     */
    test('it should be return the value when get() is called', () => {
      dataset.data.enum = 'hello; morning';

      const result = dataset.get('enum');

      expect(result).toBe('hello; morning');
    });

    /**
     *
     */
    test('it should be set value when set() is called', () => {
      dataset.set('default', 'Date.now()');

      expect(dataset.data.default).toBe('Date.now()');
    });

    const dataIsset: Array<[boolean, keyof dataColumnType, any]> = [
      [true, 'required', true],
      [false, 'required', false],
      [false, 'required', undefined],
      [true, 'min', 0],
      [false, 'min', undefined],
      [true, 'enum', 'hello; morning'],
      [false, 'enum', undefined],
    ];

    /**
     *
     */
    test.each(dataIsset)(
      `it should be return %p when isset(%p) is called with init value "%p" and the value exists`,
      (expected, opts, message) => {
        dataset.data[opts] = message;

        const result = dataset.isset(opts);

        expect(result).toBe(expected);
      },
    );

    /**
     *
     */
    test('it should be return false when isset(enum) is called with withEmptyString is false and string is empty', () => {
      dataset.data.enum = '';

      const result = dataset.isset('enum', false);

      expect(result).toBe(false);
    });

    /**
     *
     */
    test('it should be return true when isset(enum) is called with withEmptyString is true and string is empty', () => {
      dataset.data.enum = '';

      const result = dataset.isset('enum', true);

      expect(result).toBe(true);
    });
  });

  /**
   *
   */
  describe('Check the table values', () => {
    /**
     *
     */
    test(`it should be return the table name when getTableName() is called`, () => {
      const name = dataset.getTableName();

      expect(name).toBe('cName');
    });

    /**
     *
     */
    test(`it should be return the table name when getTableName() is called from subcolumn`, () => {
      const name = dataset.getColumn('cSubName1').getTableName();

      expect(name).toBe('cName.cSubName1');
    });

    /**
     *
     */
    test(`it should be return the table name when getTableName() is called from subsubcolumn`, () => {
      const name = dataset
        .getColumn('cSubName3')
        .getColumn('cSubSubName1')
        .getTableName();

      expect(name).toBe('cName.cSubName3[].cSubSubName1');
    });

    /**
     *
     */
    test(`it should be return the table name when getTableName() is called from subsubcolumn with selectedColumn`, () => {
      const name = dataset
        .getColumn('cSubName3')
        .getColumn('cSubSubName1')
        .getTableName(dataset.getColumn('cSubName3'));

      expect(name).toBe('cSubSubName1');
    });

    /**
     *
     */
    test(`it should be return the type when getTableType() is called with type is an object`, () => {
      const name = dataset.getTableType();

      expect(name).toBe('object');
    });

    /**
     *
     */
    test(`it should be return the type when getTableType() is called with type is an array`, () => {
      const name = dataset
        .getColumn('cSubName3')

        .getTableType();

      expect(name).toBe('[object]');
    });

    /**
     *
     */
    test(`it should be return the type when getTableType() is called with type is an string`, () => {
      const name = dataset.getColumn('cSubName1').getTableType();

      expect(name).toBe('string');
    });

    /**
     *
     */
    test(`it should be return the type when getTableType() is called with type is an multiple boolean array`, () => {
      const name = dataset.getColumn('cSubName2').getTableType();

      expect(name).toBe('[[boolean]]');
    });
  });

  /**
   *
   */
  describe('Check the subTypes', () => {
    /**
     *
     */
    test(`it should be a empty array when getSubTypes() is called without sub types`, () => {
      const name = dataset.getSubTypes();

      expect(name).toEqual([]);
    });

    /**
     *
     */
    test(`it should be a empty array when getSubTypes() is called with sub types`, () => {
      const name = dataset.getColumn('cSubName2').getSubTypes();

      expect(name).toEqual(['arrayType', 'boolean']);
    });

    /**
     *
     */
    test(`it should be set sub types when setSubTypes() is called`, () => {
      const subColumn = dataset.getColumn('cSubName2');

      subColumn.setSubTypes(['number']);

      expect(subColumn.subTypes).toEqual(['number']);
    });
  });

  /**
   *
   */
  describe('Check the index-context', () => {
    /**
     *
     */
    test(`it should be return the index name when getIndexName() is called`, () => {
      const name = dataset.getIndexName();

      expect(name).toEqual('cName_');
    });

    /**
     *
     */
    test(`it should be return undefined when getIndex() is called and the column has no index [1]`, () => {
      parent.getIndex.mockReturnValue(undefined);

      const result = dataset.getIndex();

      expect(result).toBe(undefined);

      expect(parent.getIndex).toHaveBeenCalledTimes(1);
      expect(parent.getIndex).toHaveBeenCalledWith('cName_');
    });

    /**
     *
     */
    test(`it should be return undefined when getIndex() is called and the column has no index [2]`, () => {
      const index = new (IndexDataset as any)();
      parent.getIndex.mockReturnValue(index);
      index.isReadonly.mockReturnValue(false);

      const result = dataset.getIndex();

      expect(result).toBe(undefined);

      expect(parent.getIndex).toHaveBeenCalledTimes(1);
      expect(parent.getIndex).toHaveBeenCalledWith('cName_');
      expect(index.isReadonly).toHaveBeenCalledTimes(1);
    });

    /**
     *
     */
    test(`it should be return the index when getIndex() is called`, () => {
      const index = new (IndexDataset as any)();
      parent.getIndex.mockReturnValue(index);
      index.isReadonly.mockReturnValue(true);

      const result = dataset.getIndex();

      expect(result).toBe(index);

      expect(parent.getIndex).toHaveBeenCalledTimes(1);
      expect(parent.getIndex).toHaveBeenCalledWith('cName_');
      expect(index.isReadonly).toHaveBeenCalledTimes(1);
    });
  });

  /**
   *
   */
  describe('Check the helper functions', () => {
    /**
     *
     */
    test(`it should be return the collection instance when getCollection() is called`, () => {
      const result = dataset.getCollection();

      expect(result).toBe(parent);
    });

    /**
     *
     */
    test(`it should be return the collection instance when getCollection() is called from a sub sub column`, () => {
      const result = dataset
        .getColumn('cSubName3')
        .getColumn('cSubSubName1')
        .getCollection();

      expect(result).toBe(parent);
    });

    /**
     *
     */
    test(`it should be sorted the sub columns when sortColumns() is called`, () => {
      parent.sort.mockReturnValue(1);
      parent.sort.mockReturnValueOnce(-1);

      const c1 = dataset.getColumn('cSubName1');
      const c2 = dataset.getColumn('cSubName2');
      const c3 = dataset.getColumn('cSubName3');

      dataset.sortColumns();

      expect(parent.sort).toHaveBeenCalledTimes(3);
      expect(parent.sort).toHaveBeenNthCalledWith(1, c2, c1);
      expect(parent.sort).toHaveBeenNthCalledWith(2, c3, c2);
      expect(parent.sort).toHaveBeenNthCalledWith(3, c3, c1);

      expect(dataset.columns).toEqual([c2, c1, c3]);
    });

    /**
     *
     */
    test(`it should be remove this column and the column index when remove() is called`, () => {
      const index = new (IndexDataset as any)();
      parent.getIndex.mockReturnValue(index);
      index.isReadonly.mockReturnValue(true);

      dataset.remove();

      expect(parent.removeColumn).toHaveBeenCalledTimes(1);

      expect(parent.getIndex).toHaveBeenCalledTimes(1);
      expect(parent.getIndex).toHaveBeenCalledWith('cName_');
      expect(index.isReadonly).toHaveBeenCalledTimes(1);
      expect(index.remove).toHaveBeenCalledTimes(1);
    });

    /**
     *
     */
    test(`it should be remove this column when remove() is called`, () => {
      parent.getIndex.mockReturnValue(undefined);

      dataset.remove();

      expect(parent.removeColumn).toHaveBeenCalledTimes(1);

      expect(parent.getIndex).toHaveBeenCalledTimes(1);
      expect(parent.getIndex).toHaveBeenCalledWith('cName_');
    });

    /**
     *
     */
    test(`it should be return a data object when getObject() is called`, () => {
      const result = dataset.getObject();

      expect(result).toEqual({
        name: 'cName',
        required: true,
        subColumns: [
          {
            name: 'cSubName1',
            required: true,
            subColumns: undefined,
            subTypes: undefined,
            type: 'string',
          },
          {
            name: 'cSubName2',
            subColumns: undefined,
            subTypes: ['arrayType', 'boolean'],
            type: 'arrayType',
          },
          {
            name: 'cSubName3',
            subColumns: [
              {
                name: 'cSubSubName1',
                required: true,
                subColumns: undefined,
                subTypes: undefined,
                type: 'number',
              },
            ],
            subTypes: undefined,
            type: 'array',
          },
        ],
        subTypes: undefined,
        type: 'object',
      });
    });
  });
});
