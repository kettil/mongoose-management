import AbstractColumnsDataset from './abstractColumn';
import CollectionDataset from './collection';
import IndexDataset from './index';

import {
  dataColumnInternalValuesType,
  dataColumnType,
  dataIndexColumnValueType,
  dataIndexType,
  schemaNormalType,
} from '../../types';

/**
 *
 */
export type optionsType = Exclude<keyof dataColumnType, keyof dataColumnInternalValuesType | 'name'>;

/**
 *
 */
export default class ColumnDataset extends AbstractColumnsDataset<ColumnDataset | CollectionDataset, ColumnDataset> {
  protected data: dataColumnType;
  protected columns: ColumnDataset[];
  protected subTypes: schemaNormalType[];

  protected index?: IndexDataset;

  /**
   *
   * @param column
   * @param collection
   */
  constructor(
    column: dataColumnType,
    parent: ColumnDataset | CollectionDataset,
    protected collection: CollectionDataset,
  ) {
    super(parent);

    this.data = column;
    this.columns = column.subColumns ? column.subColumns.map((c) => new ColumnDataset(c, this, collection)) : [];
    this.subTypes = column.subTypes ? column.subTypes : [];

    this.setIndex(collection.getIndex(this.getIndexName()));
  }

  /**
   *
   */
  getName(withBrackets = false) {
    return withBrackets && this.get('type') === 'array' ? `${this.data.name}[]` : this.data.name;
  }

  /**
   *
   */
  setName(name: string) {
    const oldName = this.getFullname(false, false);

    this.data.name = name;
    this.getParent().sortColumns();
    this.refreshIndex();

    // update all indexes
    this.collection
      .getIndexes()
      .filter((i) => !i.isReadonly()) // ignore column indexes
      .forEach((i) => i.updateColumnName(oldName, this.getFullname(false, false)));
  }

  /**
   *
   * @param withArrayBrackets
   * @param withoutBrackets
   */
  getFullname(withBracketsForThisColumn = false, withBrackets = true) {
    const name: string[] = [];

    if (this.parent instanceof ColumnDataset) {
      name.push(this.parent.getFullname(true, withBrackets));
    }

    name.push(this.getName(withBracketsForThisColumn && withBrackets));

    return name.join('.');
  }

  /**
   *
   * @param key
   */
  get<K extends optionsType>(key: K): dataColumnType[K] {
    return this.data[key];
  }

  /**
   *
   * @param key
   * @param value
   */
  set<K extends optionsType>(key: K, value: dataColumnType[K]) {
    this.data[key] = value;
  }

  /**
   *
   * @param key
   */
  isset<K extends optionsType>(key: K, withEmptyString = true) {
    const value = this.get(key);

    switch (typeof value) {
      case 'boolean':
        return value === true;

      case 'number':
        return true;

      case 'string':
        return value === '' ? withEmptyString : true;

      default:
        return false;
    }
  }

  /**
   *
   * @param selectedColumn
   */
  getTableName(selectedColumn?: ColumnDataset, withArrayBrackets = false) {
    let name = this.getName(withArrayBrackets);

    if (this.parent instanceof ColumnDataset && this.parent !== selectedColumn) {
      name = `${this.parent.getTableName(selectedColumn, true)}.${name}`;
    }

    return name;
  }

  /**
   *
   */
  getTableType() {
    const type = this.get('type');
    if (type === 'array') {
      return '[object]';
    }

    if (type === 'arrayType') {
      return `[${this.subTypes.reduceRight((p, c) => (c === 'arrayType' ? `[${p}]` : c), '')}]`;
    }

    return type;
  }

  /**
   *
   */
  getSubTypes() {
    return this.subTypes;
  }

  /**
   *
   * @param subTypes
   */
  setSubTypes(subTypes: schemaNormalType[]) {
    this.subTypes = subTypes;
  }

  /**
   *
   */
  getIndexName() {
    return this.getFullname(false, false) + '_';
  }

  /**
   *
   */
  getIndex() {
    return this.index;
  }

  /**
   *
   * @param index
   */
  setIndex(index?: IndexDataset) {
    if (index === undefined) {
      // remove the index
      this.index = undefined;
    } else {
      // set the index
      const cName = this.getIndexName();
      const iName = index.getName();

      if (cName !== iName) {
        throw new Error(`The index is not named like the column (${cName} !== ${iName})`);
      }

      this.index = index;
    }
  }

  /**
   *
   */
  getIndexColumn(value: dataIndexColumnValueType): dataIndexType['columns'] {
    return { [this.getFullname(false, false)]: value };
  }

  /**
   *
   */
  refreshIndex() {
    if (this.index) {
      const value = this.index.getColumnValue();

      if (!value) {
        throw new Error('The column has a index but the index value is not defined');
      }

      this.index.setName(this.getIndexName());
      this.index.setColumns(this.getIndexColumn(value));
    }

    // Updates the subcolumns
    this.getColumns().forEach((c) => c.refreshIndex());
  }

  /**
   *
   */
  getCollection() {
    return this.collection;
  }

  /**
   *
   */
  sortColumns() {
    this.columns.sort(this.collection.sort);
  }

  /**
   *
   */
  remove() {
    const index = this.getIndex();
    if (index) {
      index.remove();
    }

    this.parent.removeColumn(this);
  }

  /**
   *
   */
  getObject(): dataColumnType {
    return {
      ...this.data,
      subColumns: this.columns.length > 0 ? this.columns.map((c) => c.getObject()) : undefined,
      subTypes: this.subTypes.length > 0 ? this.subTypes : undefined,
    };
  }
}
