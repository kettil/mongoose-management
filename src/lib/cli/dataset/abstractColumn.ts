import { sortByName } from '../helper/sort';
import AbstractDataset from './abstract';

export interface InterfaceColumnDataset<T> {
  getName: () => string;
  flatColumns: () => T[];
  setReference: () => void;
  getFullname(withBracketsForThisColumn?: boolean, withBrackets?: boolean): string;
}

export default abstract class AbstractColumnsDataset<P, T extends InterfaceColumnDataset<T>> extends AbstractDataset<
  P
> {
  protected abstract columns: T[];

  getColumns() {
    return this.columns;
  }

  getColumn(name: string, withSubColumns = false) {
    const columns = withSubColumns
      ? this.flatColumns().filter((c) => c.getFullname(false, false) === name)
      : this.getColumns().filter((c) => c.getName() === name);

    return columns.length === 1 ? columns[0] : undefined;
  }

  addColumn(column: T) {
    column.setReference();

    this.columns.push(column);
    this.sortColumns();

    return column;
  }

  flatColumns(): T[] {
    return this.columns.reduce<T[]>((p, c) => p.concat(c, c.flatColumns()), []);
  }

  removeColumn(column: T) {
    this.columns = this.columns.filter((c) => c !== column);
  }

  sortColumns() {
    this.columns.sort(sortByName);
  }
}
