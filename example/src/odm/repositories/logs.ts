/*
 * ######################################################################
 * #                                                                    #
 * #                      This file can be edited.                      #
 * #                                                                    #
 * #              The file is only created if none exists.              #
 * #                                                                    #
 * ######################################################################
 *
 * @see https://mongoosejs.com/docs/guide.html#options
 */

import { SchemaOptions } from 'mongoose';
import { LogsTypes } from '../documents/logs';
import { ExportType } from '../types';
// import * as nsLogs from '../types/logs';

/* eslint-disable no-param-reassign, no-underscore-dangle */
export const options: SchemaOptions = {
  collection: 'logs',

  toObject: {
    getters: true,
    virtuals: true,
    transform: (_: unknown, returnValue: ExportType<LogsTypes>): Record<string, unknown> => {
      delete returnValue._id;
      delete returnValue.__v;

      return returnValue;
    },
  },

  toJSON: {
    getters: true,
    virtuals: true,
    transform: (_: unknown, returnValue: ExportType<LogsTypes>): Record<string, unknown> => {
      delete returnValue._id;
      delete returnValue.__v;

      return returnValue;
    },
  },

  strict: 'throw',
  timestamps: true,
  useNestedStrict: false,
};
/* eslint-enable no-param-reassign, no-underscore-dangle */

/**
 * Add you own custom functions to the document instance
 *
 * Example:
 * ```typescript
 * export const methods = {
 *   getStringId: function(this: nsLogs.LogsDocument): string {
 *     return this._id.toHexString();
 *   },
 * };
 * ```
 *
 * @see https://mongoosejs.com/docs/guide.html#methods
 */
export const methods = {};

/**
 * Add you own custom static functions to the model
 *
 * Example:
 * ```typescript
 * export const statics = {
 *   findByX: async function(this: nsLogs.LogsDocumentQuery, x: string) {
 *     return this.find({ x }).exec();
 *   },
 * };
 * ```
 *
 * @see https://mongoosejs.com/docs/guide.html#statics
 */
export const statics = {};

/**
 * Add you own custom query helper functions to the model
 *
 * Example:
 * ```typescript
 * export const query = {
 *   byName: function(this: nsLogs.LogsDocumentQuery, name: string) {
 *     return this.find({ name });
 *   },
 * };
 * ```
 *
 * @see https://mongoosejs.com/docs/guide.html#query-helpers
 */
export const queries = {};

/**
 * Add you own custom virtual properties to the document instance
 *
 * The parameters "get" and "set" are optional.
 *
 * The return value of "get" and the value of "set"
 * must be of the same variable type if both are used.
 *
 * Example:
 * ```typescript
 * export const virtual = {
 *   name: {
 *     get: function(this: nsLogs.LogsVirtual): string {
 *       return this.firstname + ' ' + this.lastname;
 *     },
 *     set: function(this: nsLogs.LogsVirtual, value: string) {
 *       this.firstname = value.substr(0, value.indexOf(' '));
 *       this.lastname = value.substr(value.indexOf(' ') + 1);
 *     },
 *   },
 * };
 * ```
 *
 * @see https://mongoosejs.com/docs/guide.html#virtuals
 */
export const virtuals = {};
