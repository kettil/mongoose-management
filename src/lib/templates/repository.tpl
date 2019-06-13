/**
 * ######################################################################
 * #                                                                    #
 * #                      This file can be edited.                      #
 * #                                                                    #
 * #              The file is only created if none exists.              #
 * #                                                                    #
 * ######################################################################
 */

import { SchemaOptions, SchemaDefinition } from 'mongoose';

import {{collectionNameUpper}} from '../interfaces/{{collectionNameLower}}';

/**
 * Extends the schema definition to include settings that cannot be read from the database
 *
 * The key "type" is ignored.
 *
 * @see https://mongoosejs.com/docs/guide.html
 * @see https://mongoosejs.com/docs/schematypes.html
 */
export const extendSchemaDefinition: SchemaDefinition = { {{schemaExtend}} };

/**
 * Schema Optionen
 *
 * @see https://mongoosejs.com/docs/guide.html#options
 */
export const options: SchemaOptions = {
  collection: '{{collectionNameRaw}}',
  toObject: {
    getters: true,
    virtuals: true,
    transform: (doc, ret) => {
      delete ret._id;
      return ret;
    },
  },
  toJSON: {
    getters: true,
    virtuals: true,
  },

  useNestedStrict: false,
  strict: 'throw',
  timestamps: true,
};

/**
 * Add you own custom functions to the document instance
 *
 * @see https://mongoosejs.com/docs/guide.html#methods
 */
export const methods = {
  /*
  getStringId: function(this: {{collectionNameUpper}}.IMethods): string {
    return this._id.toHexString();
  },
  */
};

/**
 * Add you own custom static functions to the model
 *
 * @see https://mongoosejs.com/docs/guide.html#statics
 */
export const statics = {
  /*
  findByX: async function(this: {{collectionNameUpper}}.IStatics, x: string) {
    return this.find({ x }).exec();
  },
  */
};

/**
 * Add you own custom query helper functions to the model
 *
 * @see https://mongoosejs.com/docs/guide.html#query-helpers
 */
export const query = {
  /*
  byName: function(this: {{collectionNameUpper}}.IQuery, name: string) {
    return this.find({ name });
  },
  */
};

/**
 * Add you own custom virtual properties to the document instance
 *
 * The parameters "get" and "set" are optional.
 *
 * @see https://mongoosejs.com/docs/guide.html#virtuals
 */
export const virtual = {
  /*
  name: {
    get: function(this: {{collectionNameUpper}}.IVirtual): string {
      return this.firstname + ' ' + this.lastname;
    },
    set: function(this: {{collectionNameUpper}}.IVirtual, name: string) {
      this.firstname = v.substr(0, v.indexOf(' '));
      this.lastname = v.substr(v.indexOf(' ') + 1);
    },
  },
  */
};
