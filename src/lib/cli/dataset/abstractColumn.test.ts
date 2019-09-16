jest.mock('./column');

import ColumnDataset from './column';

import AbstractColumnDataset from './abstractColumn';

/**
 *
 */
describe('Check the AbstractColumnDataset class', () => {
  let parent: any;
  let column1: any;
  let column2: any;
  let dataset: any;

  /**
   *
   */
  beforeEach(() => {
    parent = jest.fn();
    column1 = new (ColumnDataset as any)();
    column2 = new (ColumnDataset as any)();

    dataset = new (AbstractColumnDataset as any)(parent);

    dataset.columns = [column1, column2];
  });

  /**
   *
   */
  test('initialize the class', () => {
    expect(dataset).toBeInstanceOf(AbstractColumnDataset);

    expect(dataset.parent).toBe(parent);
  });

  /**
   *
   */
  test('it should be return columns when getColumns() is called', () => {
    const columns = dataset.getColumns();

    expect(columns).toEqual([column1, column2]);
  });

  /**
   *
   */
  test('it should be return expected column when getColumn() is called with an existing name', () => {
    column1.getName.mockReturnValue('column1');
    column2.getName.mockReturnValue('column2');

    const column = dataset.getColumn('column2');

    expect(column).toBe(column2);
  });

  /**
   *
   */
  test('it should be return undefined when getColumn() is called with an non-existing name', () => {
    column1.getName.mockReturnValue('column1');
    column2.getName.mockReturnValue('column2');

    const column = dataset.getColumn('column5');

    expect(column).toBe(undefined);
  });

  /**
   *
   */
  test('it should be add a new column to the column list when addColumn() is called with a column', () => {
    const column6 = new (ColumnDataset as any)();

    dataset.sortColumns = jest.fn();

    const column = dataset.addColumn(column6);

    expect(column).toBe(column6);

    expect(dataset.columns).toEqual([column1, column2, column6]);

    expect(dataset.sortColumns).toHaveBeenCalledTimes(1);
  });

  /**
   *
   */
  test('it should be return all columns when flatColumns() is called without subcolumns', () => {
    column1.flatColumns.mockReturnValue([]);
    column2.flatColumns.mockReturnValue([]);

    const columns = dataset.flatColumns();

    expect(columns).toEqual([column1, column2]);
  });

  /**
   *
   */
  test('it should be return all columns (with subcolumns) when flatColumns() is called with subcolumns', () => {
    const column11 = new (ColumnDataset as any)();
    const column12 = new (ColumnDataset as any)();
    const column21 = new (ColumnDataset as any)();

    column1.flatColumns.mockReturnValue([column11, column12]);
    column2.flatColumns.mockReturnValue([column21]);

    const columns = dataset.flatColumns();

    expect(columns).toEqual([column1, column11, column12, column2, column21]);
  });

  /**
   *
   */
  test('it should be remove the column from the column list when removeColumn() is called', () => {
    dataset.removeColumn(column2);

    expect(dataset.columns).toEqual([column1]);
  });
});
