/**
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { IndexOptions } from 'mongodb';
import { SchemaTypeOpts } from 'mongoose';

/**
 * Helpers
 */
type Keys<T> = { [K in keyof T]: T[K] extends never ? never : K }[keyof T];
type Diff<T, U> = T extends U ? never : T;

/**
 * Extracts the type from the function
 */
type virtualFunctionTypeGet<T extends { [k: string]: any }> = T['get'] extends () => void
  ? ReturnType<T['get']>
  : never;
type virtualFunctionTypeSet<T extends { [k: string]: any }> = T['set'] extends (value: infer A) => void ? A : never;

/**
 * List of all types (with the type "never")
 */
type virtualFunctionTypeGetList<T> = { [K in keyof T]: virtualFunctionTypeGet<T[K]> };
type virtualFunctionTypeSetList<T> = { [K in keyof T]: virtualFunctionTypeSet<T[K]> };

/**
 * List of all types (without the type "never")
 */
type virtualTypeGetList<T> = Pick<virtualFunctionTypeGetList<T>, Keys<virtualFunctionTypeGetList<T>>>;
type virtualTypeSetList<T> = Pick<virtualFunctionTypeSetList<T>, Keys<virtualFunctionTypeSetList<T>>>;

/**
 * List of Keys where the object have only "get"
 */
type virtualKeysGetOnly<T> = Diff<keyof virtualTypeGetList<T>, keyof virtualTypeSetList<T>>;

/**
 * List of Keys where without "get only" objects
 */
type virtualKeysBoth<T> = Diff<keyof T, virtualKeysGetOnly<T>>;

export type virtualType<T> = {
  readonly [K in keyof virtualTypeGetList<T> & virtualKeysGetOnly<T>]: virtualTypeGetList<T>[K];
} &
  { [K in keyof virtualTypeGetList<T> & virtualKeysBoth<T>]: virtualTypeGetList<T>[K] } &
  { [K in keyof virtualTypeSetList<T>]: virtualTypeSetList<T>[K] };

/**
 *
 */
export type extendTimestampType = {
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

/**
 *
 */
export type extendIdType = {
  readonly _id: any;
  readonly id: any;
};

/**
 *
 */
export type indexType = { fields: { [k: string]: number }; options?: IndexOptions };

/**
 *
 */
export type schemaExtendType<T extends Record<string, any>> = {
  [K in keyof T]?: T[K] extends Array<schemaExtendType<T>> ? [schemaExtendType<T[K][0]>] : SchemaTypeOpts<any>;
};
