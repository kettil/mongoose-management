/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention */
/*
 * ######################################################################
 * #                                                                    #
 * #                       Do not change the file!                      #
 * #                                                                    #
 * # All changes are deleted the next time the collection data is read. #
 * #                                                                    #
 * ######################################################################
 */

import { IndexOptions } from 'mongodb';
import { Document, DocumentQuery, Aggregate, Model } from 'mongoose';

// ##### Virtuals #####

/**
 * Helpers
 */
type Keys<T> = { [K in keyof T]: T[K] extends never ? never : K }[keyof T];
type Diff<T, U> = T extends U ? never : T;

/**
 * Extracts the type from the function
 */
type VirtualFunctionTypeGet<T extends { [k: string]: any }> = T['get'] extends () => void
  ? ReturnType<T['get']>
  : never;
type VirtualFunctionTypeSet<T extends { [k: string]: any }> = T['set'] extends (value: infer A) => void ? A : never;

/**
 * List of all types (with the type "never")
 */
type VirtualFunctionTypeGetList<T> = { [K in keyof T]: VirtualFunctionTypeGet<T[K]> };
type VirtualFunctionTypeSetList<T> = { [K in keyof T]: VirtualFunctionTypeSet<T[K]> };

/**
 * List of all types (without the type "never")
 */
type VirtualTypeGetList<T> = Pick<VirtualFunctionTypeGetList<T>, Keys<VirtualFunctionTypeGetList<T>>>;
type VirtualTypeSetList<T> = Pick<VirtualFunctionTypeSetList<T>, Keys<VirtualFunctionTypeSetList<T>>>;

/**
 * List of Keys where the object have only "get"
 */
type VirtualKeysGetOnly<T> = Diff<keyof VirtualTypeGetList<T>, keyof VirtualTypeSetList<T>>;

/**
 * List of Keys where without "get only" objects
 */
type VirtualKeysBoth<T> = Diff<keyof T, VirtualKeysGetOnly<T>>;

type VirtualSet<T> = { [K in keyof VirtualTypeSetList<T>]: VirtualTypeSetList<T>[K] };
type VirtualGet<T> = { [K in keyof VirtualTypeGetList<T> & VirtualKeysBoth<T>]: VirtualTypeGetList<T>[K] };
type VirtualOnlyGet<T> = {
  readonly [K in keyof VirtualTypeGetList<T> & VirtualKeysGetOnly<T>]: VirtualTypeGetList<T>[K];
};

export type VirtualType<T> = VirtualOnlyGet<T> & VirtualGet<T> & VirtualSet<T>;

// ##### Middleware #####

type MiddlewareMethodDocument = 'validate' | 'save' | 'remove';
type MiddlewareMethodQueryWithout = 'update' | 'updateOne' | 'updateMany' | 'deleteOne' | 'deleteMany';
type MiddlewareMethodQueryCount = 'countDocuments';
type MiddlewareMethodQuerySingle = 'findOne' | 'findOneAndDelete' | 'findOneAndRemove' | 'findOneAndUpdate';
type MiddlewareMethodQueryMultiple = 'find';
type MiddlewareMethodAggreagate = 'aggregate';
type MiddlewareMethodInsert = 'insertMany';

type MiddlewareReturn = Promise<void> | void;

type MiddlewarePre<
  D extends Document,
  Q extends DocumentQuery<D | D[], D>,
  A extends Aggregate<D>,
  M extends Model<D>,
  E extends Record<string, unknown>
> = {
  (method: 'init', cb: (this: D) => void): void;
  (method: MiddlewareMethodDocument, cb: (this: D) => MiddlewareReturn): void;
  (method: MiddlewareMethodQueryCount, cb: (this: Q & E) => MiddlewareReturn): void;
  (method: MiddlewareMethodQueryMultiple, cb: (this: Q & E) => MiddlewareReturn): void;
  (method: MiddlewareMethodQuerySingle, cb: (this: Q & E) => MiddlewareReturn): void;
  (method: MiddlewareMethodQueryWithout, cb: (this: Q & E) => MiddlewareReturn): void;
  (method: MiddlewareMethodAggreagate, cb: (this: A) => MiddlewareReturn): void;
  (method: MiddlewareMethodInsert, cb: (this: M) => MiddlewareReturn): void;
};

type MiddlewarePost<
  D extends Document,
  Q extends DocumentQuery<D | D[], D>,
  A extends Aggregate<D>,
  M extends Model<D>,
  E extends Record<string, unknown>
> = {
  (method: 'init', cb: (this: D, doc: D) => void): void;
  (method: MiddlewareMethodDocument, cb: (this: D, doc: D) => MiddlewareReturn): void;
  (method: MiddlewareMethodQueryCount, cb: (this: Q & E, count: number) => MiddlewareReturn): void;
  (method: MiddlewareMethodQueryMultiple, cb: (this: Q & E, docs: D[]) => MiddlewareReturn): void;
  (method: MiddlewareMethodQuerySingle, cb: (this: Q & E, doc: D) => MiddlewareReturn): void;
  (method: MiddlewareMethodQueryWithout, cb: (this: Q & E) => MiddlewareReturn): void;
  (method: MiddlewareMethodAggreagate, cb: (this: A, docs: D[]) => MiddlewareReturn): void;
  (method: MiddlewareMethodInsert, cb: (this: M, docs: D[]) => MiddlewareReturn): void;
};

type ClearExtendQuery<
  D extends Document,
  Q extends DocumentQuery<D | D[], D>,
  E extends Record<string, unknown>
> = Partial<Omit<E, keyof Q>>;

export type MiddlewareHandler<
  D extends Document,
  Q extends DocumentQuery<D | D[], D>,
  A extends Aggregate<D>,
  M extends Model<D>,
  ExtendQuery extends Record<string, unknown>
> = (
  pre: MiddlewarePre<D, Q, A, M, ClearExtendQuery<D, Q, ExtendQuery>>,
  post: MiddlewarePost<D, Q, A, M, ClearExtendQuery<D, Q, ExtendQuery>>,
) => void;

// ##### Others #####

export type ExtendTimestampType = {
  readonly createdAt: Date;
  readonly updatedAt: Date;
};

export type ExtendIdType = {
  id: any;
};

export type ExportType<T extends Record<string, unknown>> = T &
  ExtendTimestampType &
  ExtendIdType & {
    _id: unknown;
    __v: unknown;
  };

type IndexOptionsExclude = 'dropDups' | 'min' | 'max' | 'v' | 'session' | 'w' | 'j' | 'wtimeout';

export type IndexType = {
  fields: { [k: string]: 1 | -1 | 'text' | '2dsphere' | 'hashed' };
  options: Pick<IndexOptions, Exclude<keyof IndexOptions, IndexOptionsExclude>>;
};
