import AbstractColumnsDataset from './abstractColumn';
import ColumnDataset from './column';
import GroupDataset from './group';
import IndexDataset from './index';

import { sortByName } from '../helper/sort';

import { dataCollectionType, schemaType } from '../../types';

export const specialColumns: Array<[string, schemaType]> = [
  ['createdAt', 'date'],
  ['updatedAt', 'date'],
  ['_id', 'objectId'],
];

export default class CollectionDataset extends AbstractColumnsDataset<GroupDataset, ColumnDataset> {
  protected name: string;
  protected columns: ColumnDataset[];
  protected indexes: IndexDataset[];

  constructor(collection: dataCollectionType, parent: GroupDataset) {
    super(parent);

    const specials = specialColumns.map(([name, type]) => new ColumnDataset({ name, type }, this, this, true));

    this.indexes = collection.indexes.map((i) => new IndexDataset(i, this));
    this.columns = collection.columns.map((c) => new ColumnDataset(c, this, this)).concat(specials);
    this.name = collection.name;

    this.sortColumns();
  }

  setReference() {
    this.columns.forEach((column) => column.setReference());
    this.indexes.forEach((index) => index.setReference());
  }

  getName(): string {
    return this.name;
  }

  setName(name: string) {
    this.name = name;
    this.parent.sortCollections();
  }

  getIndexes() {
    return this.indexes;
  }

  getIndex(name: string) {
    const indexes = this.indexes.filter((i) => i.getName() === name);

    return indexes.length === 1 ? indexes[0] : undefined;
  }

  addIndex(index: IndexDataset) {
    index.setReference();

    this.indexes.push(index);
    this.sortIndexes();

    return index;
  }

  removeIndex(index: IndexDataset) {
    this.indexes = this.indexes.filter((i) => i !== index);
  }

  sortIndexes() {
    this.indexes.sort(sortByName);
  }

  remove() {
    this.parent.removeCollection(this);
  }

  getObject(): dataCollectionType {
    const specialNames = specialColumns.map((d) => d[0]);

    return {
      name: this.name,
      columns: this.columns.filter((c) => specialNames.indexOf(c.getName()) === -1).map((c) => c.getObject()),
      indexes: this.indexes.map((i) => i.getObject()),
    };
  }
}
