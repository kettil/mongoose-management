import AbstractDataset from './abstract';
import GroupDataset from './group';

import { sortByPath } from '../helper/sort';

import { dataType } from '../../types';

export default class GroupsDataset extends AbstractDataset<undefined> {
  protected groups: GroupDataset[];

  constructor(data: dataType, protected pathProject: string) {
    super(undefined);

    this.groups = data.groups.map((g) => new GroupDataset(g, this));
  }

  setReference() {
    this.groups.forEach((group) => group.setReference());
  }

  getGroups() {
    return this.groups;
  }

  getGroup(path: string) {
    const groups = this.groups.filter((g) => g.getPath() === path);

    return groups.length === 1 ? groups[0] : undefined;
  }

  addGroup(group: GroupDataset) {
    this.groups.push(group);
    this.sortGroups();

    group.setReference();

    return group;
  }

  removeGroup(group: GroupDataset) {
    this.groups = this.groups.filter((g) => g !== group);
  }

  sortGroups() {
    this.groups.sort(sortByPath);
  }

  getName(): string {
    throw new Error('Groups has no name');
  }

  remove() {
    throw new Error('Groups can not be removed');
  }

  getPathProject() {
    return this.pathProject;
  }

  getObject(): dataType {
    return {
      groups: this.groups.map((g) => g.getObject()),
    };
  }
}
