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
  let index: any;
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
        { name: 'cSubName2', type: 'string', required: true },
        { name: 'cSubName1', type: 'arrayType', subTypes: ['arrayType', 'boolean'] },
        {
          name: 'cSubName3',
          type: 'array',
          subColumns: [{ name: 'cSubSubName1', type: 'number', required: true }],
        },
      ],
    };

    index = new (IndexDataset as any)();
    parent = new (CollectionDataset as any)();
    parent.getIndex.mockReturnValueOnce(undefined);
    parent.getIndex.mockReturnValueOnce(undefined);
    parent.getIndex.mockReturnValueOnce(undefined);
    parent.getIndex.mockReturnValueOnce(undefined);
    parent.getIndex.mockReturnValueOnce(index);
    index.getName.mockReturnValueOnce('cName_');
  });

  afterEach(() => {
    dataset = undefined;
  });

  /**
   *
   */
  test('initialize the class [1]', () => {
    dataset = new ColumnDataset(data, parent, parent);

    expect(dataset).toBeInstanceOf(ColumnDataset);

    expect(dataset.parent).toBeInstanceOf(CollectionDataset);
    expect(dataset.data).toEqual({
      name: 'cName',
      type: 'object',
      required: true,
      subColumns: [
        { name: 'cSubName2', type: 'string', required: true },
        { name: 'cSubName1', type: 'arrayType', subTypes: ['arrayType', 'boolean'] },
        { name: 'cSubName3', type: 'array', subColumns: [{ name: 'cSubSubName1', type: 'number', required: true }] },
      ],
    });
    expect(dataset.columns).toEqual([expect.any(ColumnDataset), expect.any(ColumnDataset), expect.any(ColumnDataset)]);
    expect(dataset.subTypes).toEqual([]);

    expect(index.getName).toHaveBeenCalledTimes(1);
    expect(parent.getIndex).toHaveBeenCalledTimes(5);
    expect(parent.getIndex).toHaveBeenNthCalledWith(1, 'cName.cSubName2_');
    expect(parent.getIndex).toHaveBeenNthCalledWith(2, 'cName.cSubName1_');
    expect(parent.getIndex).toHaveBeenNthCalledWith(3, 'cName.cSubName3.cSubSubName1_');
    expect(parent.getIndex).toHaveBeenNthCalledWith(4, 'cName.cSubName3_');
    expect(parent.getIndex).toHaveBeenNthCalledWith(5, 'cName_');
  });

  /**
   *
   */
  test('initialize the class [2]', () => {
    parent.getIndex.mockClear();
    parent.getIndex.mockReturnValue(undefined);

    dataset = new ColumnDataset({ ...data, subColumns: undefined, type: 'string', required: false }, parent, parent);

    expect(dataset).toBeInstanceOf(ColumnDataset);

    expect(dataset.parent).toBeInstanceOf(CollectionDataset);
    expect(dataset.data).toEqual({ name: 'cName', type: 'string', required: false });
    expect(dataset.columns).toEqual([]);
    expect(dataset.subTypes).toEqual([]);

    expect(index.getName).toHaveBeenCalledTimes(0);
    expect(parent.getIndex).toHaveBeenCalledTimes(1);
    expect(parent.getIndex).toHaveBeenNthCalledWith(1, 'cName_');
  });

  /**
   *
   */
  test('initialize the class [3]', () => {
    parent.getIndex.mockClear();
    parent.getIndex.mockReturnValue(undefined);

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

    expect(index.getName).toHaveBeenCalledTimes(0);
    expect(parent.getIndex).toHaveBeenCalledTimes(1);
    expect(parent.getIndex).toHaveBeenNthCalledWith(1, 'cName_');
  });

  /**
   *
   */
  test('it should be return the name when getName() is called', () => {
    dataset = new ColumnDataset(data, parent, parent);

    const name = dataset.getName();

    expect(name).toBe('cName');
  });

  /**
   *
   */
  test('it should be return the name when getName() is called with type ”array"', () => {
    dataset = new ColumnDataset(data, parent, parent);

    dataset.data.type = 'array';
    const name = dataset.getName(true);

    expect(name).toBe('cName[]');
  });

  /**
   *
   */
  test('it should be change the name and the collection will be re-sorted when setName() is called', () => {
    const mockIndex1 = new (IndexDataset as any)();
    const mockIndex2 = new (IndexDataset as any)();

    mockIndex1.isReadonly.mockReturnValue(true);
    mockIndex2.isReadonly.mockReturnValue(false);

    parent.getIndexes.mockReturnValue([mockIndex1, mockIndex2]);

    dataset = new ColumnDataset(data, parent, parent);
    dataset.refreshIndex = jest.fn();

    dataset.setName('new-cName');

    expect(dataset.data.name).toBe('new-cName');
    expect(dataset.refreshIndex).toHaveBeenCalledTimes(1);
    expect(parent.sortColumns).toHaveBeenCalledTimes(1);
    expect(parent.getIndexes).toHaveBeenCalledTimes(1);
    expect(mockIndex1.isReadonly).toHaveBeenCalledTimes(1);
    expect(mockIndex2.isReadonly).toHaveBeenCalledTimes(1);
    expect(mockIndex1.updateColumnName).toHaveBeenCalledTimes(0);
    expect(mockIndex2.updateColumnName).toHaveBeenCalledTimes(1);
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
      beforeEach(() => {
        dataset = new ColumnDataset(data, parent, parent);
      });

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
    beforeEach(() => {
      dataset = new ColumnDataset(data, parent, parent);
    });

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
    beforeEach(() => {
      dataset = new ColumnDataset(data, parent, parent);
    });

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
      'it should be return %p when isset(%p) is called with init value "%p" and the value exists',
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
    beforeEach(() => {
      dataset = new ColumnDataset(data, parent, parent);
    });

    /**
     *
     */
    test('it should be return the table name when getTableName() is called', () => {
      const name = dataset.getTableName();

      expect(name).toBe('cName');
    });

    /**
     *
     */
    test('it should be return the table name when getTableName() is called from subcolumn', () => {
      const name = dataset.getColumn('cSubName1').getTableName();

      expect(name).toBe('cName.cSubName1');
    });

    /**
     *
     */
    test('it should be return the table name when getTableName() is called from subsubcolumn', () => {
      const name = dataset
        .getColumn('cSubName3')
        .getColumn('cSubSubName1')
        .getTableName();

      expect(name).toBe('cName.cSubName3[].cSubSubName1');
    });

    /**
     *
     */
    test('it should be return the table name when getTableName() is called from subsubcolumn with selectedColumn', () => {
      const name = dataset
        .getColumn('cSubName3')
        .getColumn('cSubSubName1')
        .getTableName(dataset.getColumn('cSubName3'));

      expect(name).toBe('cSubSubName1');
    });

    /**
     *
     */
    test('it should be return the type when getTableType() is called with type is an object', () => {
      const name = dataset.getTableType();

      expect(name).toBe('object');
    });

    /**
     *
     */
    test('it should be return the type when getTableType() is called with type is an array', () => {
      const name = dataset.getColumn('cSubName3').getTableType();

      expect(name).toBe('[object]');
    });

    /**
     *
     */
    test('it should be return the type when getTableType() is called with type is an string', () => {
      const name = dataset.getColumn('cSubName2').getTableType();

      expect(name).toBe('string');
    });

    /**
     *
     */
    test('it should be return the type when getTableType() is called with type is an multiple boolean array', () => {
      const name = dataset.getColumn('cSubName1').getTableType();

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
    beforeEach(() => {
      dataset = new ColumnDataset(data, parent, parent);
    });

    /**
     *
     */
    test('it should be a empty array when getSubTypes() is called without sub types', () => {
      const name = dataset.getSubTypes();

      expect(name).toEqual([]);
    });

    /**
     *
     */
    test('it should be a empty array when getSubTypes() is called with sub types', () => {
      const name = dataset.getColumn('cSubName1').getSubTypes();

      expect(name).toEqual(['arrayType', 'boolean']);
    });

    /**
     *
     */
    test('it should be set sub types when setSubTypes() is called', () => {
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
    beforeEach(() => {
      dataset = new ColumnDataset(data, parent, parent);
    });

    /**
     *
     */
    test('it should be return the index name when getIndexName() is called', () => {
      const name = dataset.getIndexName();

      expect(name).toEqual('cName_');
    });

    /**
     *
     */
    test('it should be return index when getIndex() is called', () => {
      const result = dataset.getIndex();

      expect(result).toBe(index);
    });

    /**
     *
     */
    test('it should be remove the index when setIndex() is called without index', () => {
      dataset.setIndex();

      expect(dataset.index).toBe(undefined);
    });

    /**
     *
     */
    test('it should be set the index when setIndex() is called with index', () => {
      const mockIndex = new (IndexDataset as any)();

      mockIndex.getName.mockReturnValue('cName_');

      dataset.setIndex(mockIndex);

      expect(dataset.index).toBe(mockIndex);

      expect(mockIndex.getName).toHaveBeenCalledTimes(1);
    });

    /**
     *
     */
    test('it should be throw an error when setIndex() is called with index but the name is different', () => {
      const mockIndex = new (IndexDataset as any)();

      mockIndex.getName.mockReturnValue('cOther_');

      expect.assertions(4);
      try {
        dataset.setIndex(mockIndex);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('The index is not named like the column (cName_ !== cOther_)');

        // old index value
        expect(dataset.index).toBe(index);

        expect(mockIndex.getName).toHaveBeenCalledTimes(1);
      }
    });

    /**
     *
     */
    test('it should be return the index column structure when getIndexColumn() is called', () => {
      const result = dataset.getIndexColumn('text');

      expect(result).toEqual({ cName: 'text' });
    });

    /**
     *
     */
    test('it should be updated the index and also the index of the subcolumns when refreshIndex() is called and the index is defined', () => {
      index.getColumnValue.mockReturnValue('hashed');

      expect(dataset.columns.length).toBe(3);

      dataset.columns[0].refreshIndex = jest.fn();
      dataset.columns[1].refreshIndex = jest.fn();
      dataset.columns[2].refreshIndex = jest.fn();

      dataset.refreshIndex();

      expect(index.getColumnValue).toHaveBeenCalledTimes(1);
      expect(index.setName).toHaveBeenCalledTimes(1);
      expect(index.setName).toHaveBeenCalledWith('cName_');
      expect(index.setColumns).toHaveBeenCalledTimes(1);
      expect(index.setColumns).toHaveBeenCalledWith({ cName: 'hashed' });

      expect(dataset.columns[0].refreshIndex).toHaveBeenCalledTimes(1);
      expect(dataset.columns[1].refreshIndex).toHaveBeenCalledTimes(1);
      expect(dataset.columns[2].refreshIndex).toHaveBeenCalledTimes(1);
    });

    /**
     *
     */
    test('it should be throw an error when refreshIndex() is called and the index is defined but value is wrong', () => {
      expect.assertions(9);

      index.getColumnValue.mockReturnValue(undefined);

      expect(dataset.columns.length).toBe(3);

      dataset.columns[0].refreshIndex = jest.fn();
      dataset.columns[1].refreshIndex = jest.fn();
      dataset.columns[2].refreshIndex = jest.fn();

      try {
        dataset.refreshIndex();
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect(err.message).toBe('The column has a index but the index value is not defined');

        expect(index.getColumnValue).toHaveBeenCalledTimes(1);
        expect(index.setName).toHaveBeenCalledTimes(0);
        expect(index.setColumns).toHaveBeenCalledTimes(0);

        expect(dataset.columns[0].refreshIndex).toHaveBeenCalledTimes(0);
        expect(dataset.columns[1].refreshIndex).toHaveBeenCalledTimes(0);
        expect(dataset.columns[2].refreshIndex).toHaveBeenCalledTimes(0);
      }
    });

    /**
     *
     */
    test('it should be updated the indexes of the subcolumns when refreshIndex() is called and the index is not defined', () => {
      dataset.index = undefined;

      expect(dataset.columns.length).toBe(3);

      dataset.columns[0].refreshIndex = jest.fn();
      dataset.columns[1].refreshIndex = jest.fn();
      dataset.columns[2].refreshIndex = jest.fn();

      dataset.refreshIndex();

      expect(dataset.columns[0].refreshIndex).toHaveBeenCalledTimes(1);
      expect(dataset.columns[1].refreshIndex).toHaveBeenCalledTimes(1);
      expect(dataset.columns[2].refreshIndex).toHaveBeenCalledTimes(1);
    });
  });

  /**
   *
   */
  describe('Check the helper functions', () => {
    /**
     *
     */
    beforeEach(() => {
      dataset = new ColumnDataset(data, parent, parent);
    });

    /**
     *
     */
    test('it should be return the collection instance when getCollection() is called', () => {
      const result = dataset.getCollection();

      expect(result).toBe(parent);
    });

    /**
     *
     */
    test('it should be return the collection instance when getCollection() is called from a sub sub column', () => {
      const result = dataset
        .getColumn('cSubName3')
        .getColumn('cSubSubName1')
        .getCollection();

      expect(result).toBe(parent);
    });

    /**
     *
     */
    test('it should be sorted the sub columns when sortColumns() is called', () => {
      const c1 = dataset.getColumn('cSubName1');
      const c2 = dataset.getColumn('cSubName2');
      const c3 = dataset.getColumn('cSubName3');

      dataset.sortColumns();

      expect(dataset.columns).toEqual([c1, c2, c3]);
    });

    /**
     *
     */
    test('it should be remove this column and the column index when remove() is called', () => {
      dataset.remove();

      expect(parent.removeColumn).toHaveBeenCalledTimes(1);
      expect(parent.removeColumn).toHaveBeenCalledWith(dataset);
      expect(index.remove).toHaveBeenCalledTimes(1);
    });

    /**
     *
     */
    test('it should be remove this column when remove() is called', () => {
      dataset.index = undefined;

      dataset.remove();

      expect(parent.removeColumn).toHaveBeenCalledTimes(1);
      expect(parent.removeColumn).toHaveBeenCalledWith(dataset);
    });

    /**
     *
     */
    test('it should be return a data object when getObject() is called', () => {
      const result = dataset.getObject();

      expect(result).toEqual({
        name: 'cName',
        required: true,
        subColumns: [
          {
            name: 'cSubName2',
            required: true,
            subColumns: undefined,
            subTypes: undefined,
            type: 'string',
          },
          {
            name: 'cSubName1',
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
