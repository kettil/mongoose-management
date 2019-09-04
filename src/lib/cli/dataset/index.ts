import AbstractDataset from './abstract';
import CollectionDataset from './collection';

import { dataIndexColumnValueType, dataIndexType, schemaIndexType } from '../../types';

/**
 *
 */
export default class IndexDataset extends AbstractDataset<CollectionDataset> {
  protected name: string;
  protected columns: dataIndexType['columns'];
  protected properties: dataIndexType['properties'];

  protected readonly: boolean;

  /**
   *
   * @param index
   * @param collection
   */
  constructor(index: dataIndexType, collection: CollectionDataset) {
    super(collection);

    this.name = index.name;
    this.columns = index.columns;
    this.properties = index.properties;

    this.readonly = index.readonly === true;
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
    this.getParent().sortIndexes();
  }

  /**
   *
   */
  getColumns(): dataIndexType['columns'] {
    return this.columns;
  }

  /**
   *
   * @param columns
   */
  setColumns(columns: dataIndexType['columns']) {
    this.columns = columns;
  }

  /**
   *
   * @param key
   */
  getProperty<K extends keyof dataIndexType['properties']>(key: K): dataIndexType['properties'][K] {
    return this.properties[key];
  }

  /**
   *
   * @param key
   * @param value
   */
  setProperty<K extends keyof dataIndexType['properties']>(key: K, value: dataIndexType['properties'][K]) {
    this.properties[key] = value;
  }

  /**
   *
   */
  getColumnType(): schemaIndexType {
    switch (true) {
      case this.getProperty('unique'):
        return 'unique';

      case this.getProperty('sparse'):
        return 'sparse';

      default:
        return 'index';
    }
  }

  /**
   *
   */
  getColumnValue(): dataIndexColumnValueType | undefined {
    const values = Object.values(this.getColumns());

    return values.length === 1 ? values[0] : undefined;
  }

  /**
   *
   */
  isReadonly(): boolean {
    return this.readonly;
  }

  /**
   *
   */
  remove() {
    this.getParent().removeIndex(this);
  }

  /**
   *
   */
  getObject(): dataIndexType {
    return {
      name: this.name,
      columns: this.columns,
      properties: {
        unique: this.properties.unique ? true : undefined,
        sparse: this.properties.sparse ? true : undefined,
      },

      readonly: this.readonly ? true : undefined,
    };
  }
}
