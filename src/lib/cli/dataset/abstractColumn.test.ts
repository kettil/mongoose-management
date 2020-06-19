import ColumnDataset from './column';

import AbstractColumnDataset from './abstractColumn';

describe('Check the AbstractColumnDataset class', () => {
  let parent: any;
  let column1: any;
  let column8: any;
  let dataset: any;

  beforeEach(() => {
    parent = {
      getIndex: jest.fn(),
      specialColumns: [],
    };

    dataset = new (AbstractColumnDataset as any)(parent);

    column1 = new ColumnDataset({ name: 'col1', type: 'date' }, parent, parent);
    column8 = new ColumnDataset(
      { name: 'col8', type: 'object', subColumns: [{ name: 'col8sub', type: 'string' }] },
      parent,
      parent,
    );

    dataset.columns = [column1, column8];
  });

  test('initialize the class', () => {
    expect(dataset).toBeInstanceOf(AbstractColumnDataset);

    expect(dataset.parent).toBe(parent);
  });

  test('it should be return columns when getColumns() is called', () => {
    const columns = dataset.getColumns();

    expect(columns).toEqual([column1, column8]);
  });

  test('it should be return expected column when getColumn() is called with an existing name', () => {
    const column = dataset.getColumn('col8');

    expect(column).toBe(column8);
  });

  test('it should be return expected column when getColumn() is called with an existing (sub)name and withSubColumns is true', () => {
    const column = dataset.getColumn('col8.col8sub', true);

    expect(column).toEqual(expect.any(ColumnDataset));
  });

  test('it should be return undefined when getColumn() is called with an existing (sub)name and withSubColumns is false', () => {
    const column = dataset.getColumn('col8.col8sub');

    expect(column).toBe(undefined);
  });

  test('it should be return undefined when getColumn() is called with an non-existing name', () => {
    const column = dataset.getColumn('col5');

    expect(column).toBe(undefined);
  });

  test('it should be add a new column to the column list when addColumn() is called with a column', () => {
    const column4 = new ColumnDataset({ name: 'col4', type: 'number' }, parent, parent);

    const column = dataset.addColumn(column4);

    expect(column).toBe(column4);

    expect(dataset.columns).toEqual([column1, column4, column8]);

    expect(parent.getIndex).toHaveBeenCalledTimes(1);
    expect(parent.getIndex).toHaveBeenCalledWith('col4_');
  });

  test('it should be return all columns when flatColumns() is called without subcolumns', () => {
    const columns = dataset.flatColumns();

    expect(columns).toEqual([column1, column8, expect.any(ColumnDataset)]);
  });

  test('it should be return all columns (with subcolumns) when flatColumns() is called with subcolumns', () => {
    const column6 = new ColumnDataset(
      { name: 'col6', type: 'object', subColumns: [{ name: 'col6-1', type: 'string' }] },
      parent,
      parent,
    );

    dataset.addColumn(column6);

    const columns = dataset.flatColumns();

    expect(columns).toEqual([column1, column6, expect.any(ColumnDataset), column8, expect.any(ColumnDataset)]);
  });

  test('it should be remove the column from the column list when removeColumn() is called', () => {
    dataset.removeColumn(column8);

    expect(dataset.columns).toEqual([column1]);
  });
});
