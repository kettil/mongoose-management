import AbstractDataset from './abstract';
import CollectionDataset from './collection';
import ColumnDataset from './column';

import { dataIndexColumnValueType, dataIndexType } from '../../types';

export type indexColumnsType = [ColumnDataset, dataIndexColumnValueType];

export default class IndexDataset extends AbstractDataset<CollectionDataset> {
  protected name: string;
  protected columns: indexColumnsType[] = [];
  protected properties: dataIndexType['properties'];

  protected readonly: boolean;

  constructor(protected index: dataIndexType, collection: CollectionDataset) {
    super(collection);

    this.name = index.name;
    this.properties = index.properties;

    this.readonly = index.readonly === true;
  }

  setReference() {
    this.columns = Object.entries(this.index.columns)
      .map<indexColumnsType>(([name, value]) => [this.getCollection().getColumn(name)!, value])
      .filter(([column]) => column !== undefined);
  }

  getName(): string {
    return this.name;
  }

  setName(name: string) {
    this.name = name;
    this.getCollection().sortIndexes();
  }

  getColumns() {
    return this.columns;
  }

  getColumnsNormalize() {
    return this.columns.reduce<dataIndexType['columns']>(
      (prev, [column, value]) => ({ ...prev, [column.getFullname(false, false)]: value }),
      {},
    );
  }

  setColumns(columns: indexColumnsType[]) {
    this.columns = columns;
  }

  hasColumn(name: string) {
    return this.getColumns().filter(([c]) => c.getFullname(false, false) === name).length === 1;
  }

  getProperty<K extends keyof dataIndexType['properties']>(key: K): dataIndexType['properties'][K] {
    return this.properties[key];
  }

  setProperty<K extends keyof dataIndexType['properties']>(key: K, value: dataIndexType['properties'][K]) {
    this.properties[key] = value;
  }

  isReadonly(): boolean {
    return this.readonly;
  }

  remove() {
    this.getParent().removeIndex(this);
  }

  getCollection() {
    return this.getParent();
  }

  getObject(): dataIndexType {
    return {
      name: this.name,
      columns: this.getColumnsNormalize(),
      properties: {
        unique: this.properties.unique ? true : undefined,
        sparse: this.properties.sparse ? true : undefined,
      },

      readonly: this.readonly ? true : undefined,
    };
  }
}
