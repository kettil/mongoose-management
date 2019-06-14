/**
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { Schema } from 'mongoose';

/**
 *
 * @param schema
 * @param virtual
 */
export const addVirtualProperties = (
  schema: Schema,
  virtual: { [k: string]: { get?: () => void; set?: () => void } },
) => {
  Object.entries(virtual).forEach(([name, { get, set }]) => {
    const space = schema.virtual(name);

    if (typeof get === 'function') {
      space.get(get);
    }
    if (typeof set === 'function') {
      space.set(set);
    }
  });
};

/**
 *
 * @param name
 * @param items
 */
export const checkDuplicateKeys = (name: string, items: Array<{}>) => {
  const keys = extractKeys(items);
  const duplicates = getDuplicates(keys);

  if (duplicates.length > 0) {
    throw new Error(`Double keys were assigned in the scheme "${name}": ` + duplicates.join(', '));
  }
};

/**
 *
 * @param items
 */
export const getDuplicates = (items: string[]) => {
  const counter: { [k: string]: number } = {};
  const duplicates: string[] = [];

  items.forEach((key) => {
    if (!counter[key]) {
      counter[key] = 1;
    } else {
      counter[key] += 1;
    }
  });

  Object.entries(counter).forEach(([key, count]) => {
    if (count > 1) {
      duplicates.push(key);
    }
  });

  return duplicates;
};

/**
 *
 * @param items
 */
export const extractKeys = (items: Array<{}>) => {
  return items.map((o) => Object.keys(o)).reduce((keys, oKeys) => keys.concat(oKeys), []);
};
