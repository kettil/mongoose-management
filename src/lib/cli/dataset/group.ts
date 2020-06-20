import AbstractDataset from './abstract';
import CollectionDataset from './collection';
import GroupsDataset from './groups';

import { sortByName } from '../helper/sort';

import { dataGroupType, schemaType } from '../../types';

export const idType = 'objectId';
export const idTypes = [
  [undefined, 'Global'],
  ['objectId', 'ObjectId'],
  ['uuidv4', 'UUIDv4'],
] as const;

export default class GroupDataset extends AbstractDataset<GroupsDataset> {
  protected path: dataGroupType['path'];
  protected idType: dataGroupType['idType'];
  protected multipleConnection: dataGroupType['multipleConnection'];

  protected collections: CollectionDataset[];

  constructor(group: dataGroupType, groups: GroupsDataset) {
    super(groups);

    this.path = group.path;
    this.collections = group.collections.map((c) => new CollectionDataset(c, this));

    this.idType = group.idType || idType;
    this.multipleConnection = group.multipleConnection === true;
  }

  setReference() {
    this.collections.forEach((collection) => collection.setReference());
  }

  getPath(): string {
    return this.path;
  }

  setPath(path: string) {
    this.path = path;
  }

  getCollections() {
    return this.collections;
  }

  getCollection(name: string) {
    const collections = this.collections.filter((c) => c.getName() === name);

    return collections.length === 1 ? collections[0] : undefined;
  }

  addCollection(collection: CollectionDataset) {
    this.collections.push(collection);
    this.sortCollections();

    collection.setReference();

    return collection;
  }

  removeCollection(collection: CollectionDataset) {
    this.collections = this.collections.filter((c) => c !== collection);
  }

  sortCollections() {
    this.collections.sort(sortByName);
  }

  getIdType() {
    return this.idType;
  }

  setIdType(type: schemaType) {
    this.idType = type;
  }

  withMultipleConnection() {
    return this.multipleConnection;
  }

  setMultipleConnection(active: boolean) {
    this.multipleConnection = active;
  }

  getName() {
    return this.getPath();
  }

  remove() {
    this.parent.removeGroup(this);
  }

  getObject(): dataGroupType {
    return {
      path: this.path,
      collections: this.collections.map((c) => c.getObject()),
      idType: this.idType,
      multipleConnection: !!this.multipleConnection,
    };
  }
}
