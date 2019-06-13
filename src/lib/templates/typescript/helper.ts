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
export const addVirtualProperties = (schema: Schema, virtual: { [k: string]: { get?: Function; set?: Function } }) => {
  Object.entries(virtual).forEach(([name, { get, set }]) => {
    const space = schema.virtual(name);

    get && space.get(get);
    set && space.set(set);
  });
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
export const extractKeys = (items: {}[]) => {
  return items.map((o) => Object.keys(o)).reduce((keys, oKeys) => keys.concat(oKeys), []);
};
