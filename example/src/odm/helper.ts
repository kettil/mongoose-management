/* eslint-disable import/no-unused-modules, @typescript-eslint/no-explicit-any */
/*
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { Schema } from 'mongoose';
import { IndexType } from './types';

export const addIndexes = (schema: Schema, indexes: IndexType[]): void => {
  indexes.forEach(({ fields, options }) => {
    schema.index(fields, options);
  });
};

export const addVirtualProperties = (
  schema: Schema,
  virtual: { [k: string]: { get?: () => any; set?: (val: any) => void } },
): void => {
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

export const getDuplicates = (items: string[]): string[] => {
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

export const extractKeys = (items: Array<Record<string, unknown>>): string[] =>
  items.map((o) => Object.keys(o)).reduce((keys, oKeys) => keys.concat(oKeys), []);

export const checkDuplicateKeys = (name: string, items: Array<Record<string, unknown>>): void => {
  const keys = extractKeys(items);
  const duplicates = getDuplicates(keys);

  if (duplicates.length > 0) {
    throw new Error(`Double keys were assigned in the scheme "${name}": ${duplicates.join(', ')}`);
  }
};
