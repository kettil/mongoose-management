import AbstractDataset from './abstract';
import GroupDataset from './group';

import { dataType } from '../../types';

/**
 *
 */
export default class GroupsDataset extends AbstractDataset<undefined> {
  protected groups: GroupDataset[];

  /**
   *
   * @param data
   * @param pathProject
   */
  constructor(data: dataType, protected pathProject: string) {
    super(undefined);

    this.groups = data.groups.map((g) => new GroupDataset(g, this));
  }

  /**
   *
   */
  getGroups() {
    return this.groups;
  }

  /**
   *
   * @param path
   */
  getGroup(path: string) {
    const groups = this.groups.filter((g) => g.getPath() === path);

    return groups.length === 1 ? groups[0] : undefined;
  }

  /**
   *
   * @param group
   */
  addGroup(group: GroupDataset) {
    this.groups.push(group);
    this.sortGroups();

    return group;
  }

  /**
   *
   * @param group
   */
  removeGroup(group: GroupDataset) {
    this.groups = this.groups.filter((g) => g !== group);
  }

  /**
   *
   */
  sortGroups() {
    this.groups.sort(this.sort);
  }

  /**
   *
   * @param a
   * @param b
   */
  sort<T extends GroupDataset>(a: T, b: T) {
    const pathA = a.getPath().toLowerCase();
    const pathB = b.getPath().toLowerCase();

    if (pathA === pathB) {
      return 0;
    }

    return pathA < pathB ? -1 : 1;
  }

  /**
   *
   */
  getName(): string {
    throw new Error('Groups has no name');
  }

  /**
   *
   */
  remove() {
    throw new Error('Groups can not be removed');
  }

  /**
   *
   */
  getPathProject() {
    return this.pathProject;
  }

  /**
   *
   */
  getObject(): dataType {
    return {
      groups: this.groups.map((g) => g.getObject()),
    };
  }
}
