import AbstractColumnsDataset from './abstractColumn';
import ColumnDataset from './column';
import GroupDataset from './group';
import IndexDataset from './index';

import { dataCollectionType } from '../../types';

/**
 *
 */
export default class CollectionDataset extends AbstractColumnsDataset<GroupDataset, ColumnDataset> {
  protected name: string;
  protected columns: ColumnDataset[];
  protected indexes: IndexDataset[];

  constructor(collection: dataCollectionType, parent: GroupDataset) {
    super(parent);

    this.indexes = collection.indexes.map((i) => new IndexDataset(i, this));
    this.columns = collection.columns.map((c) => new ColumnDataset(c, this, this));
    this.name = collection.name;
  }

  /**
   *
   */
  getName(): string {
    return this.name;
  }

  /**
   *
   * @param name
   */
  setName(name: string) {
    this.name = name;
    this.parent.sortCollections();
  }

  /**
   *
   */
  getIndexes() {
    return this.indexes;
  }

  /**
   *
   * @param name
   */
  getIndex(name: string) {
    const indexes = this.indexes.filter((i) => i.getName() === name);

    return indexes.length === 1 ? indexes[0] : undefined;
  }

  /**
   *
   * @param index
   */
  addIndex(index: IndexDataset) {
    this.indexes.push(index);
    this.sortIndexes();

    return index;
  }

  /**
   *
   * @param index
   */
  removeIndex(index: IndexDataset) {
    this.indexes = this.indexes.filter((i) => i !== index);
  }

  /**
   *
   */
  remove() {
    this.parent.removeCollection(this);
  }

  /**
   *
   */
  sortColumns() {
    this.columns.sort(this.sort);
  }

  /**
   *
   */
  sortIndexes() {
    this.indexes.sort(this.sort);
  }

  /**
   *
   * @param a
   * @param b
   */
  sort<T extends ColumnDataset | IndexDataset>(a: T, b: T) {
    const pathA = a.getName().toLowerCase();
    const pathB = b.getName().toLowerCase();

    if (pathA === pathB) {
      return 0;
    }

    return pathA < pathB ? -1 : 1;
  }

  /**
   *
   */
  getObject(): dataCollectionType {
    return {
      name: this.name,
      columns: this.columns.map((c) => c.getObject()),
      indexes: this.indexes.map((i) => i.getObject()),
    };
  }
}
