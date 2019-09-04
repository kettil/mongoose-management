import AbstractDataset from './abstract';

/**
 *
 */
export default abstract class AbstractColumnsDataset<
  P,
  T extends { getName: () => string; flatColumns: () => T[] }
> extends AbstractDataset<P> {
  protected abstract columns: T[];

  /**
   *
   */
  abstract sortColumns(): void;

  /**
   *
   */
  getColumns() {
    return this.columns;
  }

  /**
   *
   * @param name
   */
  getColumn(name: string) {
    const columns = this.columns.filter((c) => c.getName() === name);

    return columns.length === 1 ? columns[0] : undefined;
  }

  /**
   *
   * @param subColumn
   */
  addColumn(column: T) {
    this.columns.push(column);
    this.sortColumns();

    return column;
  }

  /**
   *
   */
  flatColumns(): T[] {
    return this.columns.reduce<T[]>((p, c) => p.concat(c, c.flatColumns()), []);
  }

  /**
   *
   * @param column
   */
  removeColumn(column: T) {
    this.columns = this.columns.filter((c) => c !== column);
  }
}
