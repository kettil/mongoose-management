import Prompts from '../../prompts';

import { choicesType } from '../../types';

/**
 *
 */
export default abstract class AbstractAction<T, M = T, C = T> {
  /**
   *
   * @param options
   */
  constructor(protected prompts: Prompts) {}

  /**
   *
   * @param groups
   */
  abstract getMenuItems(groups: T[]): Array<choicesType<M>>;

  /**
   *
   * @param value
   */
  abstract async create(items: T[]): Promise<C | false>;

  /**
   *
   * @param items
   */
  abstract async edit(items: T[], item: T): Promise<void>;

  /**
   *
   */
  abstract sort(a: T, b: T): number;
}
