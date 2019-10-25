import AbstractColumnsDataset, { InterfaceColumnDataset } from './abstractColumn';
import CollectionDataset from './collection';
import IndexDataset from './index';

import {
  dataColumnInternalValuesType,
  dataColumnType,
  dataIndexColumnValueType,
  schemaIndexType,
  schemaNormalType,
} from '../../types';

export type optionsType = Exclude<keyof dataColumnType, keyof dataColumnInternalValuesType | 'name'>;

export default class ColumnDataset extends AbstractColumnsDataset<ColumnDataset | CollectionDataset, ColumnDataset>
  implements InterfaceColumnDataset<ColumnDataset> {
  protected columns: ColumnDataset[];
  protected subTypes: schemaNormalType[];

  protected index?: IndexDataset;
  protected populate?: CollectionDataset | ColumnDataset;

  constructor(
    protected column: dataColumnType,
    parent: ColumnDataset | CollectionDataset,
    protected collection: CollectionDataset,
    protected readonly: boolean = false,
  ) {
    super(parent);

    this.columns = column.subColumns ? column.subColumns.map((c) => new ColumnDataset(c, this, collection)) : [];
    this.subTypes = column.subTypes ? column.subTypes : [];
  }

  setReference() {
    this.index = this.collection.getIndex(this.getIndexName());

    if (this.column.populate) {
      const separator = this.column.populate.indexOf('.');

      if (separator >= 0) {
        // column
        const collectionName = this.column.populate.substr(0, separator);
        const columnName = this.column.populate.substr(separator + 1);
        const collection = this.collection.getParent().getCollection(collectionName);

        if (collection) {
          this.setPopulate(collection.getColumn(columnName, true));
        }
      } else {
        // collection
        this.setPopulate(this.collection.getParent().getCollection(this.column.populate));
      }
    }

    this.columns.forEach((column) => column.setReference());
  }

  getName(withBrackets = false) {
    return withBrackets && this.get('type') === 'array' ? `${this.column.name}[]` : this.column.name;
  }

  setName(name: string) {
    this.column.name = name;
    this.getParent().sortColumns();

    if (this.index) {
      this.index.setName(this.getIndexName());
    }
  }

  getFullname(withBracketsForThisColumn = false, withBrackets = true) {
    const name: string[] = [];

    if (this.parent instanceof ColumnDataset) {
      name.push(this.parent.getFullname(true, withBrackets));
    }

    name.push(this.getName(withBracketsForThisColumn && withBrackets));

    return name.join('.');
  }

  get<K extends optionsType>(key: K): dataColumnType[K] {
    return this.column[key];
  }

  set<K extends optionsType>(key: K, value: dataColumnType[K]) {
    this.column[key] = value;
  }

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

  getTableName(selectedColumn?: ColumnDataset, withArrayBrackets = false) {
    let name = this.getName(withArrayBrackets);

    if (this.parent instanceof ColumnDataset && this.parent !== selectedColumn) {
      name = `${this.parent.getTableName(selectedColumn, true)}.${name}`;
    }

    return name;
  }

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

  getSubTypes() {
    return this.subTypes;
  }

  setSubTypes(subTypes: schemaNormalType[]) {
    this.subTypes = subTypes;
  }

  getIndexName() {
    return this.getFullname(false, false) + '_';
  }

  getIndex() {
    return this.index;
  }

  getIndexType(): schemaIndexType | undefined {
    const index = this.index;
    if (index === undefined) {
      return;
    }

    switch (true) {
      case index.getProperty('unique'):
        return 'unique';

      case index.getProperty('sparse'):
        return 'sparse';

      default:
        return 'index';
    }
  }

  getIndexValue(): dataIndexColumnValueType | undefined {
    const index = this.index;
    if (index === undefined) {
      return;
    }

    const columns = index.getColumns();

    if (columns.length === 1) {
      return columns[0][1];
    }

    throw new Error('The column index has less or more than 1 entry');
  }

  setIndex(value: dataIndexColumnValueType, type: schemaIndexType) {
    if (this.index) {
      this.index.setProperty('unique', type === 'unique');
      this.index.setProperty('sparse', type === 'sparse');
      this.index.setColumns([[this, value]]);
    } else {
      this.index = this.collection.addIndex(
        new IndexDataset(
          {
            name: this.getIndexName(),
            columns: { [this.getFullname(false, false)]: value },
            readonly: true,
            properties: {
              unique: type === 'unique',
              sparse: type === 'sparse',
            },
          },
          this.collection,
        ),
      );
    }
  }

  removeIndex() {
    if (this.index) {
      this.index.remove();
      this.index = undefined;
    }
  }

  getPopulate() {
    return this.populate;
  }

  getPopulateName() {
    const populate = this.getPopulate();

    if (populate instanceof ColumnDataset) {
      return `${populate.getCollection().getName()}.${populate.getFullname(false, false)}`;
    }

    return populate ? populate.getName() : undefined;
  }

  setPopulate(collection?: CollectionDataset | ColumnDataset) {
    this.populate = collection;
  }

  isReadonly(): boolean {
    return this.readonly;
  }

  remove() {
    this.removeIndex();
    this.parent.removeColumn(this);
  }

  getCollection() {
    return this.collection;
  }

  getObject(): dataColumnType {
    const isSubColumnType = ['object', 'array'].indexOf(this.get('type')) >= 0;

    return {
      ...this.column,
      populate: this.getPopulateName(),
      subColumns: isSubColumnType ? this.columns.map((c) => c.getObject()) : undefined,
      subTypes: this.subTypes.length > 0 ? this.subTypes : undefined,
    };
  }
}
