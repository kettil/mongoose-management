import CollectionDataset from './collection';
import GroupsDataset from './groups';

import { dataGroupType } from '../../types';
import AbstractDataset from './abstract';

/**
 *
 */
export default class GroupDataset extends AbstractDataset<GroupsDataset> {
  protected path: string;

  protected collections: CollectionDataset[];

  /**
   *
   * @param group
   * @param groups
   */
  constructor(group: dataGroupType, groups: GroupsDataset) {
    super(groups);

    this.path = group.path;
    this.collections = group.collections.map((c) => new CollectionDataset(c, this));
  }

  /**
   *
   */
  getPath(): string {
    return this.path;
  }

  /**
   *
   * @param path
   */
  setPath(path: string) {
    this.path = path;
  }

  /**
   *
   */
  getCollections() {
    return this.collections;
  }

  /**
   *
   * @param name
   */
  getCollection(name: string) {
    const collections = this.collections.filter((c) => c.getName() === name);

    return collections.length === 1 ? collections[0] : undefined;
  }

  /**
   *
   * @param subCollection
   */
  addCollection(collection: CollectionDataset) {
    this.collections.push(collection);
    this.sortCollections();

    return collection;
  }

  /**
   *
   * @param index
   */
  removeCollection(collection: CollectionDataset) {
    this.collections = this.collections.filter((c) => c !== collection);
  }

  /**
   *
   */
  sortCollections() {
    this.collections.sort(this.sort);
  }

  /**
   *
   * @param a
   * @param b
   */
  sort<T extends CollectionDataset>(a: T, b: T) {
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
  getName() {
    return this.getPath();
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
  getObject(): dataGroupType {
    return {
      path: this.path,
      collections: this.collections.map((c) => c.getObject()),
    };
  }
}